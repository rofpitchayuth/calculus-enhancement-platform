import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel
from datasets import load_dataset
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, mean_absolute_error
import json

class ModelEvaluator:
    def __init__(self, base_model_name="meta-llama/Llama-3.2-3B-Instruct"):
        self.base_model_name = base_model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
    def load_base_model(self):
        """Load base Phi-2"""
        print("📦 Loading base model...")
        self.base_tokenizer = AutoTokenizer.from_pretrained(
            self.base_model_name,
            trust_remote_code=True
        )
        self.base_model = AutoModelForCausalLM.from_pretrained(
            self.base_model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
        
    def load_finetuned_model(self, adapter_path="./lora_models/final"):
        """Load LoRA fine-tuned model"""
        print(f"📦 Loading fine-tuned model from {adapter_path}...")
        self.ft_tokenizer = AutoTokenizer.from_pretrained(adapter_path)
        
        base = AutoModelForCausalLM.from_pretrained(
            self.base_model_name,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
        self.ft_model = PeftModel.from_pretrained(base, adapter_path)
        
    def generate_response(self, model, tokenizer, prompt, max_tokens=20):
        """Generate model response"""
        inputs = tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=0.1,
                do_sample=True,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id
            )
        
        full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = full_response[len(prompt):].strip()
        return response
    
    def evaluate_topic_classification(self, test_data):
        """Evaluate topic classification accuracy"""
        print("\n📊 Evaluating Topic Classification...")
        
        base_predictions = []
        ft_predictions = []
        ground_truth = []
        
        for item in test_data:
            if "derivatives" in item['instruction'] or "integrals" in item['instruction']:
                prompt = f"{item['instruction']}\n\nQuestion: {item['input']}\n\nAnswer:"
                
                # Base model
                base_pred = self.generate_response(self.base_model, self.base_tokenizer, prompt, max_tokens=5)
                base_predictions.append(base_pred.strip().lower())
                
                # Fine-tuned model
                ft_pred = self.generate_response(self.ft_model, self.ft_tokenizer, prompt, max_tokens=5)
                ft_predictions.append(ft_pred.strip().lower())
                
                ground_truth.append(item['output'].strip().lower())
                
                if len(ground_truth) >= 20:  # Sample for quick eval
                    break
        
        # Calculate accuracy
        base_acc = accuracy_score(ground_truth, base_predictions)
        ft_acc = accuracy_score(ground_truth, ft_predictions)
        
        print(f"Base Model Accuracy: {base_acc:.2%}")
        print(f"Fine-Tuned Accuracy: {ft_acc:.2%}")
        print(f"Improvement: {(ft_acc - base_acc):.2%}")
        
        return base_acc, ft_acc
    
    def run_full_evaluation(self, test_data_path="../data/processed/test.jsonl"):
        """Run complete evaluation"""
        print("🧪 Starting Full Evaluation...\n")
        
        # Load test data
        test_dataset = load_dataset('json', data_files=test_data_path, split='train')
        test_data = list(test_dataset)
        
        # Load models
        self.load_base_model()
        self.load_finetuned_model()
        
        # Evaluate
        base_acc, ft_acc = self.evaluate_topic_classification(test_data)
        
        # Summary
        print("\n" + "="*60)
        print("EVALUATION SUMMARY")
        print("="*60)
        print(f"Base Phi-2:           {base_acc:.2%}")
        print(f"LoRA Fine-Tuned:      {ft_acc:.2%}")
        print(f"Improvement:          +{(ft_acc - base_acc):.2%}")
        print("="*60)
        
        # Save results
        results = {
            "base_accuracy": float(base_acc),
            "finetuned_accuracy": float(ft_acc),
            "improvement": float(ft_acc - base_acc)
        }
        
        with open("eval_results.json", "w") as f:
            json.dump(results, f, indent=2)
        
        print("\n✅ Results saved to eval_results.json")
        
        return results

if __name__ == "__main__":
    evaluator = ModelEvaluator()
    evaluator.run_full_evaluation()
