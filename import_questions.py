#!/usr/bin/env python3
"""
================================================
import_questions.py — ALA QUIZPEDIA Question Importer
Created for A.SHAM SHARAN
================================================
Use this Python script to validate, format, and package quiz questions
from JSON files into the ALA QUIZPEDIA database format.
"""

import sys
import os
import json
import random
import time

def validate_quiz(quiz):
    """Validate that a quiz dict has all required fields."""
    errors = []
    if not isinstance(quiz, dict):
        return ["Quiz item must be a JSON object"]
    
    if not quiz.get("title"):
        errors.append("Missing quiz title")
    
    questions = quiz.get("questions")
    if not isinstance(questions, list) or len(questions) == 0:
        errors.append("Quiz must contain at least one question in 'questions' array")
    else:
        for idx, q in enumerate(questions):
            if not q.get("question"):
                errors.append(f"Question #{idx+1}: Missing question text")
            options = q.get("options")
            if not isinstance(options, list) or len(options) < 2:
                errors.append(f"Question #{idx+1}: Must have at least 2 options")
            correct = q.get("correct")
            if not isinstance(correct, int) or correct < 0 or (options and correct >= len(options)):
                errors.append(f"Question #{idx+1}: 'correct' index out of range (must be 0 to {len(options)-1 if options else 0})")
    
    return errors

def import_questions(file_path, output_path=None):
    """Load, validate, and format quiz JSON file."""
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found at '{file_path}'")
        return False

    print(f"📖 Reading questions file: {file_path}")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error parsing JSON file: {e}")
        return False

    quizzes_to_import = []
    if isinstance(data, dict) and "quizzes" in data:
        quizzes_to_import = data["quizzes"]
    elif isinstance(data, list):
        quizzes_to_import = data
    elif isinstance(data, dict) and "questions" in data:
        # Single quiz wrapped in object
        quizzes_to_import = [data]
    else:
        print("❌ Invalid JSON format. Expected object with 'quizzes' array or list of quizzes.")
        return False

    print(f"🔍 Found {len(quizzes_to_import)} quiz(zes) to process...")

    processed_quizzes = []
    total_q_count = 0

    for i, quiz in enumerate(quizzes_to_import):
        errs = validate_quiz(quiz)
        if errs:
            print(f"\n⚠️ Validation warnings for Quiz #{i+1} ('{quiz.get('title', 'Untitled')}'):")
            for err in errs:
                print(f"   - {err}")
            continue

        q_id = quiz.get("id") or f"quiz-py-{int(time.time())}-{random.randint(1000, 9999)}"
        formatted_questions = []

        for q_idx, q in enumerate(quiz["questions"]):
            options = [str(opt).strip() for opt in q.get("options", [])]
            q_text = q.get("questionText") or q.get("question", "").strip()
            
            correct_val = q.get("correctAnswer")
            if not correct_val and "correct" in q:
                try:
                    c_idx = int(q["correct"])
                    if 0 <= c_idx < len(options):
                        correct_val = options[c_idx]
                except (ValueError, TypeError):
                    pass
            
            formatted_questions.append({
                "id": q.get("id") or f"q-{int(time.time())}-{q_idx+1}-{random.randint(100, 999)}",
                "type": q.get("type", "mcq"),
                "questionText": q_text,
                "options": options,
                "correctAnswer": str(correct_val or ""),
                "explanation": q.get("explanation", "").strip(),
                "imageId": q.get("imageId", "")
            })

        processed_quiz = {
            "id": q_id,
            "title": quiz.get("title", "Imported Quiz").strip(),
            "category": quiz.get("category", "General").strip(),
            "difficulty": quiz.get("difficulty", "Mixed").strip(),
            "description": quiz.get("description", "Auto-imported quiz questions.").strip(),
            "timePerQuestion": int(quiz.get("timePerQuestion", 30)),
            "imageId": quiz.get("imageId", ""),
            "createdAt": quiz.get("createdAt", time.strftime("%Y-%m-%dT%H:%M:%SZ")),
            "questions": formatted_questions
        }

        processed_quizzes.append(processed_quiz)
        total_q_count += len(formatted_questions)

    if not processed_quizzes:
        print("❌ No valid quizzes could be processed.")
        return False

    # Package into database export structure
    export_db = {
        "users": [],
        "quizzes": processed_quizzes,
        "scores": [],
        "images": [],
        "materials": []
    }

    if not output_path:
        output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "alaquizpedia_import.json")

    with open(output_path, 'w', encoding='utf-8') as out_f:
        json.dump(export_db, out_f, indent=2)

    print("\n" + "="*50)
    print("✅ SUCCESS! QUESTIONS PROCESSED & PACKAGED")
    print("="*50)
    print(f"📊 Total Quizzes Formatted   : {len(processed_quizzes)}")
    print(f"❓ Total Questions Processed : {total_q_count}")
    print(f"💾 Output JSON Backup File   : {output_path}")
    print("\n👉 Next Steps:")
    print(" 1. Go to your live site -> Admin Panel -> 💾 Import/Export")
    print(f" 2. Upload '{os.path.basename(output_path)}' using 'Merge' mode to add these new questions!")
    print("="*50)
    return True

if __name__ == "__main__":
    print("--- ALA QUIZPEDIA Python Question Importer ---")
    
    file_arg = sys.argv[1] if len(sys.argv) > 1 else None
    if not file_arg:
        default_sample = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_questions.json")
        prompt = input(f"Enter path to questions JSON file (default: sample_questions.json): ").strip()
        file_arg = prompt if prompt else default_sample

    import_questions(file_arg)
