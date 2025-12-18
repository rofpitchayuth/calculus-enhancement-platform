"""
QLoRA Fine-Tuning Script for Llama 3.2 3B
Optimized for RTX 3060 6GB with 4-bit quantization
"""
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    BitsAndBytesConfig
)
from peft import LoraConfig, get_peft_model, TaskType, prepare_model_for_kbit_training
from datasets import load_dataset
import os

class QLoRATrainer:
    def __init__(self, model_name="meta-llama/Llama-3.2-3B-Instruct"):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        print(f"🔥 Initializing QLoRA training on {self.device}")
        print(f"Model: {model_name}")
        
    def load_model_and_tokenizer(self):
        """Load base model with 4-bit quantization + LoRA"""
        print("\n📦 Loading tokenizer...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.tokenizer.pad_token = self.tokenizer.eos_token
        
        print("📦 Loading Llama3.1 8B with 4-bit quantization...")
        
        # 4-bit quantization config
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4"
        )
        
        base_model = AutoModelForCausalLM.from_pretrained(
            self.model_name,
            quantization_config=bnb_config,
            device_map="auto",
            low_cpu_mem_usage=True,
            torch_dtype=torch.float16
        )
        
        # Prepare model for k-bit training
        base_model = prepare_model_for_kbit_training(base_model)
        
        print("🔧 Applying QLoRA configuration...")
        lora_config = LoraConfig(
            r=16,
            lora_alpha=32,
            target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
            lora_dropout=0.1,
            bias="none",
            task_type=TaskType.CAUSAL_LM
        )
        
        self.model = get_peft_model(base_model, lora_config)
        self.model.print_trainable_parameters()
        
    def load_datasets(self, data_dir="../data/processed"):
        """Load preprocessed datasets"""
        print(f"\n📚 Loading datasets from {data_dir}...")
        
        self.train_dataset = load_dataset('json', data_files=f"{data_dir}/train.jsonl", split='train')
        self.val_dataset = load_dataset('json', data_files=f"{data_dir}/val.jsonl", split='train')
        
        print(f"Train size: {len(self.train_dataset)}")
        print(f"Val size: {len(self.val_dataset)}")
        
    def preprocess_function(self, examples):
        """Format examples for training"""
        # Combine instruction + input + output
        texts = []
        for instruction, input_text, output in zip(
            examples['instruction'], 
            examples['input'], 
            examples['output']
        ):
            text = f"{instruction}\n\nQuestion: {input_text}\n\nAnswer: {output}"
            texts.append(text)
        
        # Tokenize
        tokenized = self.tokenizer(
            texts,
            truncation=True,
            max_length=512,
            padding='max_length'
        )
        tokenized["labels"] = tokenized["input_ids"].copy()
        return tokenized
    
    def train(self, output_dir="./lora_models", num_epochs=3):
        """Train the model"""
        print("\n🚀 Starting training...")
        
        # Preprocess datasets
        train_dataset = self.train_dataset.map(
            self.preprocess_function, 
            batched=True,
            remove_columns=self.train_dataset.column_names
        )
        val_dataset = self.val_dataset.map(
            self.preprocess_function,
            batched=True,
            remove_columns=self.val_dataset.column_names
        )
        
        # Training arguments (optimized for RTX 3060)
        training_args = TrainingArguments(
            output_dir=output_dir,
            num_train_epochs=num_epochs,
            per_device_train_batch_size=2,  # Small batch for 6GB VRAM
            per_device_eval_batch_size=2,
            gradient_accumulation_steps=8,  # Effective batch size = 16
            learning_rate=2e-4,
            fp16=True,  # Mixed precision
            logging_steps=10,
            save_steps=50,
            eval_steps=50,
            evaluation_strategy="steps",
            save_total_limit=3,
            load_best_model_at_end=True,
            warmup_steps=100,
            weight_decay=0.01,
            report_to="none"  # Disable wandb
        )
        
        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )
        
        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=val_dataset,
            data_collator=data_collator
        )
        
        # Train!
        print("\n⏰ Training will take approximately 4-8 hours...")
        trainer.train()
        
        # Save final model
        print(f"\n💾 Saving LoRA adapters to {output_dir}/final")
        trainer.save_model(f"{output_dir}/final")
        self.tokenizer.save_pretrained(f"{output_dir}/final")
        
        print("\n✅ Training complete!")
        return trainer

def main():
    # Initialize trainer
    trainer = QLoRATrainer()
    
    # Load model with QLoRA
    trainer.load_model_and_tokenizer()
    
    # Load datasets
    trainer.load_datasets()
    
    # Train
    trainer.train(output_dir="./qlora_models", num_epochs=3)
    
    print("\n🎉 QLoRA fine-tuning complete!")
    print("Adapters saved in: ./qlora_models/final/")
    print("\nNext steps:")
    print("1. Run evaluation: python evaluate.py")
    print("2. Update classifier to use fine-tuned model")

if __name__ == "__main__":
    main()
