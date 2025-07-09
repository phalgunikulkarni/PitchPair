from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import traceback

app = Flask(__name__)
CORS(app)

# Set your Gemini API key here
GEMINI_API_KEY = "AIzaSyARCI4eApzkXQkGHT1ShKlmkJ8fQ7nwTSY"
API_KEY = "b2e7e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2"

# Configure and test Gemini API
try:
    print("Initializing Gemini API...")
    genai.configure(api_key=GEMINI_API_KEY)    # Get available models
    print("Available models:", [m.name for m in genai.list_models()])
    model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
    test_response = model.generate_content("Test message to verify Gemini API connection.")
    if test_response and test_response.text:
        print("✅ Gemini API test successful!")
    else:
        print("⚠️ Gemini API test returned empty response")
except Exception as e:
    print(f"❌ Error testing Gemini API: {str(e)}")

@app.route('/gemini/reply', methods=['POST'])
def gemini_reply():
    try:
        # Log incoming request
        print("Received request to /gemini/reply")
        
        # API key check
        client_key = request.headers.get('x-api-key')
        if client_key != API_KEY:
            print("❌ Invalid API key")
            return jsonify({'error': 'Unauthorized'}), 401

        # Parse request data
        data = request.json
        if not data:
            print("❌ No JSON data received")
            return jsonify({'error': 'No JSON data received'}), 400

        email_text = data.get('email')
        if not email_text:
            print("❌ Missing email content")
            return jsonify({'error': 'Missing email content'}), 400

        # Log the incoming request
        print(f"Generating reply for: {email_text[:100]}...")

        prompt = f"""Write a professional email response for brand collaboration. The email should:
        - Be professional and courteous
        - Address the specific points mentioned
        - Include relevant details about experience and goals
        - End with a clear call to action
        
        Context or request: {email_text}        Write the email response:"""
        
        model = genai.GenerativeModel('models/gemini-2.0-flash-lite')
        response = model.generate_content(prompt)
        
        if response and response.text:
            print("✅ Successfully generated response")
            return jsonify({'reply': response.text})
        else:
            print("❌ Empty response from Gemini")
            return jsonify({'error': 'Empty response from AI model'}), 500

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n=== Starting Gemini API Server ===")
    print("Endpoint: http://localhost:5001/gemini/reply")
    print("Debug mode: Enabled")
    print("=================================\n")
    app.run(port=5001, debug=True)
