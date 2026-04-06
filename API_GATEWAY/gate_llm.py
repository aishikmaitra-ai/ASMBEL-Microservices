import os
import webbrowser
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env")

# Links
link1 = "http://localhost:5173/"   # Policy Creation Service
link2 = "http://localhost:8501/"   # Data Upload Service

# Initialize Groq client
client = Groq(api_key=api_key)


# 🔹 LLM Call
def ask_groq(messages):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.3   # lower = more consistent classification
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Error: {str(e)}"


# 🔥 PURE LLM ROUTER (NO RULES)
def route_prompt(user_input):

    # 🔹 Step 1: Intent classification
    classification_prompt = f"""
    Classify the user intent into ONE word only:
    - policy (for policy creation, insurance, etc.)
    - upload (for file/data upload)
    - other (anything else)

    Input: {user_input}
    """

    intent = ask_groq([
        {"role": "system", "content": "You are a strict classifier. Only return one word: policy, upload, or other."},
        {"role": "user", "content": classification_prompt}
    ]).lower()

    # 🔹 Step 2: Route based on LLM decision
    if intent == "upload":
        webbrowser.open(link2, new=2)
        return "🔁 Opening Data Upload Service..."

    elif intent == "policy":
        webbrowser.open(link1, new=2)
        return "🔁 Opening Policy Creation Service..."

    # 🔹 Step 3: Fallback to normal chat
    return ask_groq([
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": user_input}
    ])


# 🚀 CLI ENTRY POINT
if __name__ == "__main__":
    print("Smart API Gateway (LLM-only routing) (type 'exit' to quit)\n")

    while True:
        user_input = input("You: ")

        if user_input.lower() == "exit":
            print("Exiting... 👋")
            break

        reply = route_prompt(user_input)
        print("\nAI:", reply, "\n")