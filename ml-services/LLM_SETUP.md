# QLoRA Training - Llama3.2 3B (4-bit) Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd ml-services
pip install -r requirements.txt
```

### 2. Test Llama3.2 Classifier
```bash
python test_classifier.py
```
**Note:** First run will download ~4.5GB model

### 3. Collect Training Data
- Edit `data/training_dataset.csv`
- Add 200-300 labeled questions
- See template for format

### 4. Preprocess Data
```bash
cd training
python prepare_data.py
```

### 5. Train with QLoRA (4-8 hours)
```bash
python train_lora.py
```
**VRAM Usage:** ~4.5-5GB (fits RTX 3060!)

### 6. Evaluate
```bash
python evaluate.py
```
