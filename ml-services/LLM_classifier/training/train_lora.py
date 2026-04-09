"""
LoRA Fine-Tuning Setup for Llama-3.2-3B Instruct

This script is a comprehensive educational template to guide you on how to fine-tune 
your local Llama model using Parameter-Efficient Fine-Tuning (PEFT) and LoRA (Low-Rank Adaptation).

-----------------------------------------------------------------------------------------
STEP 1: DATASET PREPARATION

You need to prepare a dataset in JSONL format. Each line should represent one training example.
Usually, a robust format for chat models uses the ChatML or Llama-3 instruction formatting:

dataset.jsonl format example (one JSON object per line):
{"prompt": "<|begin_of_text|><|start_header_id|>system...<|eot_id|><|start_header_id|>user...<|end_header_id|> Question: ...<|eot_id|><|start_header_id|>assistant<|end_header_id|>", "completion": "{\\"difficulty_score\\": 0.5, \\"main_topic\\": \\"derivatives\\", ...}"}

Alternatively, you can just use `text` with the entire string if you use `SFTTrainer`.

-----------------------------------------------------------------------------------------
STEP 2: RUNNING THIS SCRIPT

Note: Do not run this on standard CPUs. It requires a dedicated GPU (e.g., RTX 3060 6GB+).
Install required training libraries first:
pip install peft trl datasets
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
# from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
# from trl import SFTTrainer
# from datasets import load_dataset
# from transformers import TrainingArguments

def train():
    print("Initiating LoRA Fine-Tuning guide...")
    
    model_id = "meta-llama/Llama-3.2-3B-Instruct"

    # 1. Load the tokenizer and add padding tokens
    # tokenizer = AutoTokenizer.from_pretrained(model_id)
    # tokenizer.pad_token = tokenizer.eos_token

    # 2. Configure 4-bit Quantization (to fit in smaller GPUs)
    # bnb_config = BitsAndBytesConfig(
    #     load_in_4bit=True,
    #     bnb_4bit_compute_dtype=torch.float16,
    #     bnb_4bit_use_double_quant=True
    # )

    # 3. Load the base model
    # model = AutoModelForCausalLM.from_pretrained(
    #     model_id, 
    #     quantization_config=bnb_config, 
    #     device_map="auto"
    # )
    
    # 4. Prepare model for k-bit training and configure LoRA
    # model = prepare_model_for_kbit_training(model)

    # LoraConfig determines which parts of the model we train. 
    # We target the Attention projection weights (q_proj, v_proj, etc.)
    # lora_config = LoraConfig(
    #     r=16,               # Rank of the LoRA matrices (higher = more capacity, more VRAM)
    #     lora_alpha=32,      # Scaling factor
    #     target_modules=["q_proj", "k_proj", "v_proj", "o_proj"], 
    #     lora_dropout=0.05,
    #     bias="none",
    #     task_type="CAUSAL_LM"
    # )
    
    # model = get_peft_model(model, lora_config)
    # model.print_trainable_parameters()
    
    # 5. Load your local dataset
    # dataset = load_dataset("json", data_files="your_dataset.jsonl", split="train")
    
    # 6. Define training arguments
    # training_args = TrainingArguments(
    #     output_dir="./lora-llama-3b-classifier",
    #     per_device_train_batch_size=2,      # Keep low for 6GB GPUs
    #     gradient_accumulation_steps=4,      # Effectively batch_size=8
    #     learning_rate=2e-4,                 # Standard LoRA LR
    #     logging_steps=10,
    #     max_steps=1000,                     # Or use num_train_epochs=3
    #     optim="paged_adamw_8bit",           # Saves optimizer memory
    #     fp16=True,                          # Use 16-bit precision
    # )

    # 7. Initialize Supervisor Fine-Tuning (SFT) Trainer
    # trainer = SFTTrainer(
    #     model=model,
    #     train_dataset=dataset,
    #     peft_config=lora_config,
    #     dataset_text_field="text",          # If your JSONL has a "text" key with the full prompt+response
    #     max_seq_length=1024,
    #     tokenizer=tokenizer,
    #     args=training_args,
    # )

    # 8. Start training!
    # trainer.train()

    # 9. Save the adapter weights
    # trainer.model.save_pretrained("./lora-llama-adapters")
    
    print("Uncomment the code within this script to run the training once your dataset is ready!")

if __name__ == "__main__":
    train()
