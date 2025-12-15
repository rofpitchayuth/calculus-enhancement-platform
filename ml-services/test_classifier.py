from classifier.phi2_classifier import get_classifier

def test_classifier():
    print("Testing Phi2 Classifier...\n")
    
    clf = get_classifier()
    
    test_questions = [
        "Find d/dx(x^2)",
        "∫2x dx = ?",
        "What is lim(x→0) sin(x)/x?",
        "Find the derivative of f(x) = x^3 * sin(x) using the product rule",
        "Prove that the derivative of e^x is e^x"
    ]
    
    for i, question in enumerate(test_questions, 1):
        print(f"\n{'='*60}")
        print(f"Question {i}: {question}")
        print('='*60)
        
        topic = clf.classify_topic(question)
        skills = clf.extract_skills(question)
        bloom = clf.detect_bloom(question)
        difficulty = clf.score_difficulty(question, bloom)
        
        print(f"Topic:      {topic}")
        print(f"Skills:     {', '.join(skills) if skills else 'None'}")
        print(f"Bloom:      {bloom}")
        print(f"Difficulty: {difficulty}")
    
    print(f"\n{'='*60}")
    print("Testing complete!")

if __name__ == "__main__":
    test_classifier()
