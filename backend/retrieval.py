import os
import json
from rapidfuzz import fuzz


def search_knowledge_base(user_question, threshold=85):
    kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base.json")
    with open(kb_path, "r", encoding="utf-8") as f:
        kb = json.load(f)

    best_match = None
    best_score = 0

    for entry in kb:
        all_phrasings = [entry["main_question"]] + entry["alternate_phrasings"]
        for phrase in all_phrasings:
            score = fuzz.token_set_ratio(user_question.lower(), phrase.lower())
            if score > best_score:
                best_score = score
                best_match = entry

    if best_score >= threshold:
        return best_match
    return None
