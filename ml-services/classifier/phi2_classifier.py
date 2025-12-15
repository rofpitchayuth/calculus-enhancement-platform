import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from typing import List
import re

class Phi2Classifier:
    def __init__(self):
        print("Loading Phi-2 model... (lighter model for 6GB GPU)")
        
        # Phi-2 only needs ~3GB VRAM - perfect for RTX 3060!
        model_name = "microsoft/phi-2"
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            trust_remote_code=True
        )
        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16,  # Use FP16 instead of 4-bit
            device_map="auto",
            trust_remote_code=True,
            low_cpu_mem_usage=True
        )
        print("Model loaded successfully!")
    
    def _generate(self, prompt: str, max_new_tokens: int = 50) -> str:
        # Phi-2 uses simple prompting, no chat template
        inputs = self.tokenizer(prompt, return_tensors="pt").to("cuda")
        
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=0.1,
                do_sample=True,
                top_p=0.9,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        full_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract only the generated part (after the prompt)
        response = full_response[len(prompt):].strip()
        return response
    
    def classify_topic(self, question_text: str) -> str:
        prompt = f"""Classify this calculus question into exactly ONE category:
- derivatives
- integrals
- limits
- applications

Question: {question_text}

Answer with ONLY the category name (one word):"""
        
        response = self._generate(prompt, max_new_tokens=10)
        response_lower = response.lower().strip()
        
        for topic in ['derivatives', 'integrals', 'limits', 'applications']:
            if topic in response_lower:
                return topic
        
        return 'applications'
    
    def extract_skills(self, question_text: str) -> List[str]:
        prompt = f"""What calculus techniques or skills are needed for this question?
Choose from: power_rule, product_rule, quotient_rule, chain_rule, substitution, 
integration_by_parts, lhopital, trigonometric, exponential, logarithmic, 
partial_fractions, implicit_differentiation, related_rates, optimization

Question: {question_text}

Answer with a comma-separated list of skills:"""
        
        response = self._generate(prompt, max_new_tokens=50)
        
        skills = [s.strip().lower().replace(' ', '_') for s in response.split(',')]
        valid_skills = ['power_rule', 'product_rule', 'quotient_rule', 'chain_rule', 
                       'substitution', 'integration_by_parts', 'lhopital', 
                       'trigonometric', 'exponential', 'logarithmic', 
                       'partial_fractions', 'implicit_differentiation', 
                       'related_rates', 'optimization']
        
        return [s for s in skills if any(vs in s for vs in valid_skills)][:3]  # Max 3 skills
    
    def detect_bloom(self, question_text: str) -> str:
        prompt = f"""Classify this calculus question according to Bloom's Taxonomy:

- Remember: Recall facts, formulas, or definitions
- Understand: Explain concepts or interpret meanings
- Apply: Use procedures to solve problems
- Analyze: Break down problems or compare methods
- Evaluate: Justify reasoning or critique solutions
- Create: Design solutions or prove theorems

Question: {question_text}

Answer with ONLY the Bloom level (one word):"""
        
        response = self._generate(prompt, max_new_tokens=10)
        
        bloom_levels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
        for level in bloom_levels:
            if level.lower() in response.lower():
                return level
        
        return 'Apply'
    
    def score_difficulty(self, question_text: str, bloom_level: str) -> float:
        bloom_base = {
            'Remember': 0.25,
            'Understand': 0.35,
            'Apply': 0.5,
            'Analyze': 0.7,
            'Evaluate': 0.85,
            'Create': 0.95
        }
        base_score = bloom_base.get(bloom_level, 0.5)

        complexity_score = 0.0
        
        if '∫' in question_text or 'integral' in question_text.lower():
            complexity_score += 0.05
        if 'd/dx' in question_text or 'derivative' in question_text.lower():
            complexity_score += 0.03
        if any(word in question_text.lower() for word in ['chain rule', 'composition']):
            complexity_score += 0.08
        if any(word in question_text.lower() for word in ['prove', 'show that', 'demonstrate']):
            complexity_score += 0.1
        
        if len(question_text) > 100:
            complexity_score += 0.05
        
        final_score = min(1.0, max(0.0, base_score + complexity_score))
        return round(final_score, 2)


_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = Phi2Classifier()
    return _classifier
