# from fastapi import FastAPI, UploadFile, File, Form
# from fastapi.middleware.cors import CORSMiddleware
# import os
# import shutil
# from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from dotenv import load_dotenv
# from langchain_openai import OpenAIEmbeddings, ChatOpenAI
# from langchain_core.messages import HumanMessage, SystemMessage
# from langchain_community.vectorstores import FAISS
# from langchain_community.embeddings import HuggingFaceEmbeddings
# from langchain_community.chat_models import ChatOpenAI
# from langchain.chains import RetrievalQA
# import uvicorn
# from typing import List
# import subprocess
# import tempfile
# import uuid
# import re
# from supabase import create_client, Client
# import requests
# import json
# from pydantic import BaseModel
# import numpy as np 
# from fastapi.staticfiles import StaticFiles
# import anthropic
# from google import genai



# load_dotenv()

# SUPABASE_URL = os.getenv("SUPABASE_URL") or ""
# SUPABASE_KEY = os.getenv("SUPABASE_KEY") or ""
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# os.makedirs("scripts", exist_ok=True)
# app.mount("/videos", StaticFiles(directory="scripts"), name="videos")

# def upload_file_to_supabase(local_file_path: str, storage_path: str) -> str:
#     with open(local_file_path, "rb") as f:
#         try:
#             res = supabase.storage.from_("videos").upload(storage_path, f)
#         except Exception as upload_error:
#             raise Exception(f"Upload threw exception: {str(upload_error)}")

#     # Validate that a path was returned
#     if not hasattr(res, "path") or not res.path:
#         raise Exception("Upload succeeded but no path was returned.")

#     # Return the public URL
#     return supabase.storage.from_("videos").get_public_url(res.path)

# @app.get("/")
# async def root():
#     return {"message": "bruh"}

# @app.post("/generate-manim/")
# async def generate_manim(prompt: str = Form(...), files: list[UploadFile] = File(...)):
#     video_id = str(uuid.uuid4())
#     temp_dir = "temp_uploads"
#     os.makedirs(temp_dir, exist_ok=True)

#     for file in files:
#         if file.filename:  # Add null check
#             file_path = os.path.join(temp_dir, file.filename)
#             with open(file_path, "wb") as buffer:
#                 shutil.copyfileobj(file.file, buffer)

#     documents = []
#     for file_name in os.listdir(temp_dir):
#         file_path = os.path.join(temp_dir, file_name)
#         if file_name.endswith('.pdf'):
#             loader = PyPDFLoader(file_path)
#         elif file_name.endswith('.txt'):
#             loader = TextLoader(file_path)
#         elif file_name.endswith('.docx'):
#             loader = Docx2txtLoader(file_path)
#         else:
#             print(f"unsupported file type: {file_name}")
#             continue
#         documents.extend(loader.load())

#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#     chunks = text_splitter.split_documents(documents)

#     embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
#     vectorstore = FAISS.from_documents(chunks, embeddings)
#     retriever = vectorstore.as_retriever(search_kwargs={"k":10})


#     retrieved_docs = retriever.get_relevant_documents(prompt)
#     query_emb = np.array(embeddings.embed_query(prompt))
#     reranked_docs = sorted(
#     retrieved_docs,
#     key=lambda doc: np.dot(query_emb, np.array(embeddings.embed_documents([doc.page_content])[0])),
#     reverse=True
#     )
#     context = "\n\n".join(doc.page_content for doc in reranked_docs)

#     # context = "\n\n".join([chunk.page_content for chunk in chunks])

#     llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
#     claude_client = anthropic.Anthropic(
#     api_key=os.environ.get("ANTHROPIC_API_KEY")
#     )

#     # googleclient = genai.Client(api_key = os.environ.get("GEMINI_API_KEY"))



#     guide_system_prompt = """
#     You are an animation expert and educationist. Your task is to generate a detailed, well-written, descriptive guide for an animated explainer video based on some given context. Output a vivid description including LaTeX expressions wherever necessary.

#      """
    

#     example = """
# Begin by slowly fading in a panoramic star field backdrop to set a cosmic stage. As the camera orients itself to reveal a three-dimensional axis frame, introduce a large title reading 'Quantum Field Theory: 
# A Journey into the Electromagnetic Interaction,' written in bold, glowing text at the center of the screen. The title shrinks and moves into the upper-left corner, making room for a rotating wireframe representation of 4D Minkowski spacetime—though rendered in 3D for clarity—complete with a light cone that stretches outward. While this wireframe slowly rotates, bring in color-coded equations of the relativistic metric, such as 
# ds2=−c2dt2+dx2+dy2+dz2ds^2 = -c^2 dt^2 + dx^2 + dy^2 + dz^2, with each component highlighted in a different hue to emphasize the negative time component and positive spatial components.

# Next, zoom the camera into the wireframe's origin to introduce the basic concept of a quantum field. Show a ghostly overlay of undulating plane waves in red and blue, symbolizing an electric field and a magnetic field respectively, oscillating perpendicularly in sync. Label these fields as E⃗\\vec{E} and B⃗\\vec{B}, placing them on perpendicular axes with small rotating arrows that illustrate their directions over time. Simultaneously, use a dynamic 3D arrow to demonstrate that the wave propagates along the z-axis. 

# As the wave advances, display a short excerpt of Maxwell's equations, morphing from their classical form in vector calculus notation to their elegant, relativistic compact form: ∂μFμν=μ0Jν\\partial_\\mu F^{\\mu \\nu} = \\mu_0 J^\\nu. Animate each transformation by dissolving and reassembling the symbols, underscoring the transition from standard form to four-vector notation.

# Then, shift the focus to the Lagrangian density for quantum electrodynamics (QED):
# LQED=ψ̄(iγμDμ−m)ψ−14FμνFμν.\\mathcal{L}_{\\text{QED}} = \\bar{\\psi}(i \\gamma^\\mu D_\\mu - m)\\psi - \\tfrac{1}{4}F_{\\mu\\nu}F^{\\mu\\nu}.

# Project this equation onto a semi-transparent plane hovering in front of the wireframe spacetime, with each symbol color-coded: the Dirac spinor ψ\\psi in orange, the covariant derivative Dμ D_\\mu in green, the gamma matrices γμ\\gamma^\\mu in bright teal, and the field strength tensor Fμν F_{\\mu\\nu} in gold. Let these terms gently pulse to indicate they are dynamic fields in spacetime, not just static quantities. 

# While the Lagrangian is on screen, illustrate the gauge invariance by showing a quick animation where ψ\\psi acquires a phase factor eiα(x)e^{i \\alpha(x)}, while the gauge field transforms accordingly. Arrows and short textual callouts appear around the equation to explain how gauge invariance enforces charge conservation.
# Next, pan the camera over to a large black background to present a simplified Feynman diagram. Show two electron lines approaching from the left and right, exchanging a wavy photon line in the center. 

# The electron lines are labeled e−e^- in bright blue, and the photon line is labeled γ\\gamma in yellow. Subtitles and small pop-up text boxes narrate how this basic vertex encapsulates the electromagnetic interaction between charged fermions, highlighting that the photon is the force carrier. Then, animate the coupling constant α≈1137\\alpha \\approx \\frac{1}{137} flashing above the diagram, gradually evolving from a numeric approximation to the symbolic form α=e24πε0ℏc\\alpha = \\frac{e^2}{4 \\pi \\epsilon_0 \\hbar c}.

# Afterward, transition to a 2D graph that plots the running of the coupling constant α\\alpha with respect to energy scale, using the renormalization group flow. As the graph materializes, a vertical axis labeled 'Coupling Strength' and a horizontal axis labeled 'Energy Scale' come into view, each sporting major tick marks and numerical values. The curve gentl...(truncated from 20157 characters)...nwhile, short textual captions in the corners clarify that this phenomenon arises from virtual particle-antiparticle pairs contributing to vacuum polarization.

# In the final sequence, zoom back out to reveal a cohesive collage of all elements: the rotating spacetime grid, the undulating electromagnetic fields, the QED Lagrangian, and the Feynman diagram floating in the foreground. Fade in an overarching summary text reading 'QED: Unifying Light and Matter Through Gauge Theory,' emphasized by a halo effect. The camera then slowly pulls away, letting the cosmic background re-emerge until each component gracefully dissolves, ending on a single star field reminiscent of the opening shot. A concluding subtitle, 'Finis,' appears, marking the animation's closure and prompting reflection on how fundamental quantum field theory is in describing our universe.

#     """


#     guide_user_prompt  = f"""
#      generate a guide for an animated Khan Academy or 3Blue1Brown-style explainer video about it. Here is a sample guide for some context about quantum field theory: {example}. \n\n
#      Context: {context} \n\n
#     Guide:
#     """
#     script_messages = [
#          SystemMessage(content=guide_system_prompt),
#             HumanMessage(content=guide_user_prompt)
#     ]
#     # try:
#     #     script_response = await llm.ainvoke(script_messages)
#     #     guide = script_response.content
#     #     print(guide)
#     # except Exception as e:
#     #     shutil.rmtree(temp_dir)
#     #     return {"error": f"Error generating script: {str(e)}"}, 500


#     manim_sys_prompt = """
#     You are an expert Manim animator. Your task is to generate clean, executable Manim Python code 
# based on a detailed description of the required animation. 
# Your output should follow these guidelines: 
# 1. The code should be fully self-contained.
# 2. Include necessary imports (like `from manim import *`)
# 3. Define a class that inherits from `Scene` with a `construct` method. 
# 4. Ensure the code is production-ready and does not contain any placeholder comments 
# or incomplete logic. 
# 5. The code should also not include any references or imports to external images, 
# it will be entirely manim code and animations that are generated. 
# 6. The output should only be the Python code, without any additional explanations or markdown.
# 7. Ensure the code results in highly visual and smooth animations. 
# 8. Ensure the code does not have incorrect placement of components like overlapping text. 
#     """
#     manim_user_prompt = f"""
#         You are an expert Manim animator. Your task is to generate clean, executable Manim Python code 
# based on a detailed description of the required animation. 
# Make sure to obey the following rules:
#     1. The code should be fully self-contained.
#     2. Include necessary imports (like `from manim import *`)
#     3. Define a class that inherits from `Scene` with a `construct` method. 
#     4. Ensure the code is production-ready and does not contain any placeholder comments 
#     or incomplete logic. 
#     5. The code should also not include any references or imports to external images, 
#     it will be entirely manim code and animations that are generated. 
#     6. The output should only be the Python code, without any additional explanations or markdown.
#     7. Ensure the code results in highly visual and smooth animations. 
#     8. Ensure the code does not have incorrect placement of components like overlapping text.
#     9. Do not generate any descriptions or comments or text. Output only the code. \n\n
    
#     Code: 
#     """
    
#     # try:
#     #     claude_response = claude_client.messages.create(
#     #         model="claude-3-5-sonnet-20241022",  # Updated to latest model
#     #         max_tokens=4000,  # Increased for longer code
#     #         messages=[
#     #             {"role": "user", "content": f"{manim_sys_prompt}\n\n{manim_user_prompt}"}
#     #         ]
#     #     )
        
#     #     # Extract text content from the response - simplified approach
#     #     content_block = claude_response.content[0]
#     #     if hasattr(content_block, 'text'):
#     #         manim_code = content_block.text
#     #     else:
#     #         # Fallback for different content types
#     #         manim_code = str(content_block)
        
#     #     # Clean up the generated code - remove markdown formatting and extract from "from manim import *"
#     #     manim_code = manim_code.strip()
        
#     #     # Remove markdown code blocks if present
#     #     if manim_code.startswith('```python'):
#     #         manim_code = manim_code[len('```python'):].strip()
#     #     elif manim_code.startswith('```'):
#     #         manim_code = manim_code[len('```'):].strip()
        
#     #     # Remove closing backticks if present
#     #     if manim_code.endswith('```'):
#     #         manim_code = manim_code[:-3].strip()
        
#     #     # Extract code starting from "from manim import *"
#     #     manim_start = manim_code.find("from manim import")
#     #     if manim_start != -1:
#     #         manim_code = manim_code[manim_start:]
#     #     else:
#     #         # If "from manim import" not found, try to find any import statement
#     #         import_start = manim_code.find("import")
#     #         if import_start != -1:
#     #             manim_code = manim_code[import_start:]
#     #         else:
#     #             raise Exception("No valid Manim import statement found in generated code")
        
#     #     print("--------------------------------------------------------------")
#     #     print("GENERATED MANIM CODE:")
#     #     print(manim_code)
#     #     print("--------------------------------------------------------------")
        
#     # except Exception as e:
#     #     shutil.rmtree(temp_dir)
#     #     return {"error": f"Error generating Manim code with Claude: {str(e)}"}, 500
    

#     main_content_url = None
#     try:
#         main_content_prompt = f"""
# Given the following context from educational materials, generate:
# 1. A concise summary (2-4 sentences).
# 2. 2-4 questions (some written, some MCQ with options and answers) that test understanding of the material. Generate 10 flashcard-style questions, with a question and answer pair, and specify as 'flashcard'.
# Format your output as JSON with a 'summary' field and a 'questions' array. Each question should have: id, type ('written' or 'mcq' or 'flashcard'), question, options (if mcq), answer. Answer should be there for all question types. Output only the JSON and nothing else. 
# Context: {context}
# """
#         main_content_messages = [
#             SystemMessage(content="You are an expert educational content creator. Generate summary and questions in JSON."),
#             HumanMessage(content=main_content_prompt)
#         ]
#         main_content_response = await llm.ainvoke(main_content_messages)
#         main_content_json = main_content_response.content
#         print("MAIN CONTENT RAW RESPONSE:", main_content_json)
#         # Remove code fences and extract JSON
#         def extract_json(text):
#             text = text.strip()
#             if text.startswith('```json'):
#                 text = text[len('```json'):].strip()
#             if text.startswith('```'):
#                 text = text.split('```')[1].strip() if '```' in text else text
#             # Extract the first {...} block
#             match = re.search(r'({[\s\S]*})', text)
#             if match:
#                 return match.group(1)
#             return text
#         main_content_json = extract_json(main_content_json)
#         main_content_data = json.loads(main_content_json)
#         print(main_content_data)
#         # Save to temp file
#         main_content_path = os.path.join(temp_dir, f"{video_id}_maincontent.json")
#         with open(main_content_path, "w", encoding="utf-8") as f:
#             json.dump(main_content_data, f, ensure_ascii=False, indent=2)
#         # Upload to Supabase
#         main_content_storage_path = f"{video_id}_maincontent.json"
#         main_content_url = upload_file_to_supabase(main_content_path, main_content_storage_path)
#         print("MAIN CONTENT UPLOADED ", main_content_url)
#     except Exception as e:
#         print(f"Error generating/uploading main content: {str(e)}")
#         main_content_url = None
    
# #     temp_manim_dir = tempfile.mkdtemp(prefix="manim_")
# #     script_filename = f"generated_scene_{uuid.uuid4().hex}.py"
# #     script_path = os.path.join(temp_manim_dir, script_filename)
# #     with open(script_path, "w", encoding="utf-8") as f:
# #         f.write(manim_code)

# #     match = re.search(r'class\s+(\w+)\s*\(\s*Scene\s*\)', manim_code)
# #     scene_class = match.group(1) if match else "MyScene"
#     # output_video_path = None
# #     try:
# #         cmd = [
# #             r"D:\knowlify-clone\backend\venv\Scripts\manim.exe",
# #             "-qk", 
# #             script_path, = os.path.join(temp_manim_dir, "media", "videos", os.path.splitext(script_filename)[0])
# #     except Exception as e: 
# #         shutil.rmtree(temp_dir)
# #         shutil.rmtree(temp_manim_dir)
# #         return {'error:'f"Error running manim: {str(e)}"}, 500
    
# #     shutil.rmtree(temp_manim_dir)
# #             scene_class
# #         ]
# #         #replace the manim exe file path here 
# #         print(f"Running Manim {' '.join(cmd)}")
# #         subprocess.run(cmd, check=True)

# #         output_dir = os.path.join(temp_manim_dir, "media", "videos", os.path.splitext(script_filename)[0])
#         # output_video_path
 

#     placeholder_url = "https://miyagilabs.ai/landingvid.mp4"
   
#     local_video_path = os.path.join(temp_dir, f"{video_id}.mp4")
#     with requests.get(placeholder_url, stream=True) as r:
#         r.raise_for_status()
#         with open(local_video_path, 'wb') as f:
#             for chunk in r.iter_content(chunk_size=8192):
#                 f.write(chunk)
#     storage_path = f"{video_id}.mp4"
#     try:
#         public_url = upload_file_to_supabase(local_video_path, storage_path)
#     except Exception as e:
#         shutil.rmtree(temp_dir)
#         return {"error": f"Error uploading to Supabase: {str(e)}"}, 500

    

#     shutil.rmtree(temp_dir)
#     return {
#         "message": "Manim code generated and video rendered!",
  
#         "video_url": public_url,
#         "main_content_url": main_content_url, 
#     }

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000) 
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import shutil
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains import RetrievalQA
import uvicorn
from typing import List
import subprocess
import tempfile
import uuid
import re
from supabase import create_client, Client
import requests
import json
from pydantic import BaseModel
from openai import OpenAI
import cv2
import base64
from pydub import AudioSegment
from gradio_client import Client
from elevenlabs import play
from elevenlabs.client import ElevenLabs
from elevenlabs.core import ApiError
from moviepy.editor import VideoFileClip, AudioFileClip, vfx


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def upload_file_to_supabase(local_file_path: str, storage_path: str) -> str:
    with open(local_file_path, "rb") as f:
        try:
            res = supabase.storage.from_("videos").upload(storage_path, f)
        except Exception as upload_error:
            raise Exception(f"Upload threw exception: {str(upload_error)}")

    if not hasattr(res, "path") or not res.path:
        raise Exception("Upload succeeded but no path was returned.")

    return supabase.storage.from_("videos").get_public_url(res.path)

@app.get("/")
async def root():
    return {"message": "bruh"}

@app.post("/generate-video/")
async def generate_video(prompt: str = Form(...), files: list[UploadFile] = File(...)):
    video_id = str(uuid.uuid4())
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)

    for file in files:
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    documents = []
    for file_name in os.listdir(temp_dir):
        file_path = os.path.join(temp_dir, file_name)
        if file_name.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        elif file_name.endswith('.txt'):
            loader = TextLoader(file_path)
        elif file_name.endswith('.docx'):
            loader = Docx2txtLoader(file_path)
        else:
            print(f"unsupported file type: {file_name}")
            continue
        documents.extend(loader.load())

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(chunks, embeddings)
    retriever = vectorstore.as_retriever(search_kwargs={"k":10})


    retrieved_docs = retriever.get_relevant_documents(prompt)
    query_emb = np.array(embeddings.embed_query(prompt))
    reranked_docs = sorted(
    retrieved_docs,
    key=lambda doc: np.dot(query_emb, np.array(embeddings.embed_documents([doc.page_content])[0])),
    reverse=True
    )
    context = "\n\n".join(doc.page_content for doc in reranked_docs)

    anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    main_content_url = None
    try:
        main_content_prompt = f"""
Given the following context from educational materials, generate:
1. A concise summary (2-4 sentences).
2. 2-4 questions (some written, some MCQ with options and answers) that test understanding of the material. Generate 10 flashcard-style questions, with a question and answer pair, and specify as 'flashcard'.
Format your output as JSON with a 'summary' field and a 'questions' array. Each question should have: id, type ('written' or 'mcq' or 'flashcard'), question, options (if mcq), answer. Answer should be there for all question types. Output only the JSON and nothing else. 
Context: {context}
"""
        main_content_messages = [
            SystemMessage(content="You are an expert educational content creator. Generate summary and questions in JSON."),
            HumanMessage(content=main_content_prompt)
        ]
        # Use Claude for main content generation
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            temperature=0.7,
            messages=[
                {"role": "user", "content": f"You are an expert educational content creator. Generate summary and questions in JSON.\n\n{main_content_prompt}"}
            ]
        )
        main_content_json = response.content[0].text
        print("MAIN CONTENT RAW RESPONSE:", main_content_json)

        def extract_json(text):
            text = text.strip()
            if text.startswith('json'):
                text = text[len('json'):].strip()
            if text.startswith(''):
                text = text.split('')[1].strip() if '' in text else text
            match = re.search(r'({[\s\S]*})', text)
            if match:
                return match.group(1)
            return text
        main_content_json = extract_json(main_content_json)
        main_content_data = json.loads(main_content_json)
        print(main_content_data)

        main_content_path = os.path.join(temp_dir, f"{video_id}_maincontent.json")
        with open(main_content_path, "w", encoding="utf-8") as f:
            json.dump(main_content_data, f, ensure_ascii=False, indent=2)
        main_content_storage_path = f"{video_id}_maincontent.json"
        main_content_url = upload_file_to_supabase(main_content_path, main_content_storage_path)
        print("MAIN CONTENT UPLOADED ", main_content_url)
    except Exception as e:
        print(f"Error generating/uploading main content: {str(e)}")
        main_content_url = None

    try:
        llm_prompt = f"""Create a Khan Academy-style educational video about: {prompt} Context from educational materials: {context}. Generate a clear, engaging, and visually appealing educational animation that explains this concept in a way similar to Khan Academy or 3Blue1Brown videos. The video should be informative, well-paced, and use visual elements to enhance understanding."""
 
        form_data = {
            'apiKey': os.getenv("KODISC_API_KEY"),
            'prompt': llm_prompt,
        }
        
        response = requests.post(
            "https://api.kodisc.com/generate/video",
            data=form_data
        )
        print(response)
        if response.status_code != 200:
            raise Exception(f" Generation request failed with status {response.status_code}: {response.text}")
        
        result = response.json()
        print(result)
        if not result.get('success'):
            error_msg = result.get('error', 'Unknown error from server')
            raise Exception(f" video generation failed: {error_msg}")
       
        kodisc_video_url = result.get('video')
        
        if not kodisc_video_url:
            raise Exception("No video URL returned from server")
        
        print(f"Video generated successfully: {kodisc_video_url}")
        
        print("Downloading video from CDN...")
        video_response = requests.get(kodisc_video_url, stream=True)
        video_response.raise_for_status()
        
        # Save the video locally
        local_video_path = os.path.join(temp_dir, f"{video_id}.mp4")
        with open(local_video_path, 'wb') as f:
            for chunk in video_response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Video downloaded to: {local_video_path}")
        storage_path = f"{video_id}.mp4"
        public_url = upload_file_to_supabase(local_video_path, storage_path)
        
        print(f"✅ Video uploaded to Supabase: {public_url}")
        
    except Exception as e:
        print(f"Error generating video: {str(e)}")
        placeholder_url = "https://miyagilabs.ai/landingvid.mp4"
        local_video_path = os.path.join(temp_dir, f"{video_id}.mp4")
        with requests.get(placeholder_url, stream=True) as r:
            r.raise_for_status()
            with open(local_video_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)
        storage_path = f"{video_id}.mp4"
        try:
            public_url = upload_file_to_supabase(local_video_path, storage_path)
        except Exception as upload_error:
            shutil.rmtree(temp_dir)
            return {"error": f"Error uploading to Supabase: {str(upload_error)}"}, 500

    shutil.rmtree(temp_dir)
    return {
        "message": "Video generated successfully!",
        "video_url": public_url,
        "main_content_url": main_content_url
    }

class NarrationRequest(BaseModel):
    video_path: str = "neuralnet.mp4"
    prompt: str

def process_video(video_path, seconds_per_frame=2):
    base64Frames = []
    video = cv2.VideoCapture(video_path)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = video.get(cv2.CAP_PROP_FPS)
    frames_to_skip = int(fps * seconds_per_frame)
    curr_frame=0
    timestamps = []

    while curr_frame < total_frames - 1:
        video.set(cv2.CAP_PROP_POS_FRAMES, curr_frame)
        success, frame = video.read()
        if not success:
            break
        _, buffer = cv2.imencode(".jpg", frame)
        base64Frames.append(base64.b64encode(buffer).decode("utf-8"))
        
        timestamp = curr_frame / fps
        timestamps.append(timestamp)
        
        curr_frame += frames_to_skip
    video.release()
    
    print(f"Extracted {len(base64Frames)} frames")
    return base64Frames, timestamps

async def create_final_video(narration_data: dict, video_path: str, output_path: str):
    """
    Generates audio using Eleven Labs, synchronizes it with the video by adjusting
    video speed, and compiles the final video.
    """
    print("Initializing Eleven Labs client...")
    client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

    # 1. Generate and stitch audio clips
    print("Generating and stitching audio clips...")
    stitched_audio = AudioSegment.empty()
    last_timestamp_sec = 0.0

    for entry in narration_data.get("narration", []):
        dialogue = entry.get("dialogue", "").strip()
        timestamp_sec = float(entry.get("timestamp", 0))

        if not dialogue:
            continue
        
        # Add silence from the end of the last clip to the start of this one
        silence_duration_ms = (timestamp_sec - last_timestamp_sec) * 1000
        if silence_duration_ms > 0:
            stitched_audio += AudioSegment.silent(duration=silence_duration_ms)
        
        try:
            # Generate audio for the current dialogue
            audio_data = client.text_to_speech.convert(
                text=dialogue,
                voice_id="JBFqnCBsd6RMkjVDRZzb", # Using a valid voice_id from docs
                model_id="eleven_multilingual_v2"
            )

            # Eleven Labs returns an iterator of bytes, which we join
            full_audio_bytes = b"".join(audio_data)

            if not full_audio_bytes:
                print(f"Warning: Received empty audio for dialogue: '{dialogue}'. Skipping.")
                continue

            try:
                segment_audio = AudioSegment(
                    data=full_audio_bytes,
                    sample_width=2,
                    frame_rate=24000, 
                    channels=1
                )
            except ValueError as e:
                print("-" * 50)
                print(f"ERROR: Corrupt audio data received for dialogue: '{dialogue}'.")
                print("This usually happens when the API returns an error message instead of audio.")
                print(f"Underlying error: {e}")
                print(f"Data received (first 100 bytes): {full_audio_bytes[:100]}")
                print("Please check your Eleven Labs API key and account status.")
                print("-" * 50)
                continue # Skip this faulty audio clip

            stitched_audio += segment_audio
            last_timestamp_sec = timestamp_sec + (len(segment_audio) / 1000.0)

        except ApiError as e:
            print("="*50)
            print("FATAL ERROR: An API error occurred with Eleven Labs.")
            print("This is likely an issue with your API key or account.")
            print(f"DETAILS: {e.body}")
            print("="*50)
            # Re-raise the exception to be caught by the main endpoint handler
            raise e
    
    # Save the final stitched audio to a temporary file
    temp_audio_path = "backend/temp_full_audio.mp3"
    stitched_audio.export(temp_audio_path, format="mp3")
    print(f"Stitched audio saved to {temp_audio_path}")

    # 2. Synchronize and compile video
    print("Loading video and audio clips for synchronization...")
    video_clip = VideoFileClip(video_path)
    audio_clip = AudioFileClip(temp_audio_path)

    video_duration = video_clip.duration
    audio_duration = audio_clip.duration

    print(f"Original video duration: {video_duration:.2f}s")
    print(f"Generated audio duration: {audio_duration:.2f}s")

    # Calculate speed factor
    if audio_duration > 0:
        speed_factor = video_duration / audio_duration
        print(f"Calculated video speed factor: {speed_factor:.2f}")
        # Apply speed adjustment
        final_clip = video_clip.fx(vfx.speedx, speed_factor)
    else:
        print("Warning: Audio duration is zero. Using original video.")
        final_clip = video_clip

    # Set the new audio
    final_clip = final_clip.set_audio(audio_clip)

    # 3. Write final video
    print(f"Writing final video to {output_path}...")
    final_clip.write_videofile(output_path, codec="libx264", audio_codec="aac", temp_audiofile='backend/temp-audio.m4a', remove_temp=True)

    # 4. Clean up temporary audio file
    video_clip.close()
    audio_clip.close()
    final_clip.close()
    os.remove(temp_audio_path)
    
    print("Final video created successfully.")

@app.post("/generate-narration/")
async def generate_narration(request: NarrationRequest):
    try:
        base64Frames, timestamps = process_video(request.video_path)
        
        # Instantiate the OpenAI client
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    
        content_payload = [
            {
                "type": "text",
                "text": f"You are an expert scriptwriter for educational videos. Your task is to create a narration script for a video about '{request.prompt}'. I will provide you with a series of frames from the video, each with its exact timestamp. Your script should be engaging, clear, and synchronized with the visuals. The dialogue will be based on whatever the video is currently topic or explaining. It will change accordingly to the current video content. Please output the script as a JSON object with a 'narration' key, which is a list of objects, each with 'timestamp' and 'dialogue'. Ensure the timestamps in your output correspond to the ones I provide. Here are the frames:"
            }
        ]

        for frame_data, timestamp in zip(base64Frames, timestamps):
            content_payload.append({
                "type": "text",
                "text": f"Frame at timestamp: {timestamp:.2f} seconds"
            })
            content_payload.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{frame_data}",
                    "detail": "low"
                }
            })

        messages = [
            {
                "role": "user",
                "content": content_payload
            }
        ]

        response = client.chat.completions.create(
            model="gpt-4o",
            max_tokens=4000,
            temperature=0.7,
            messages=messages
        )
        
        narration_json = response.choices[0].message.content
        
        def extract_json(text):
            text = text.strip()
            if text.startswith('json'):
                text = text[len('json'):].strip()
            if text.startswith(''):
                text = text.split('')[1].strip() if '' in text else text
            match = re.search(r'({[\s\S]*})', text)
            if match:
                return match.group(1)
            return text
            
        narration_data = json.loads(extract_json(narration_json))

        try:
            video_filename = os.path.basename(request.video_path)
            base_filename, _ = os.path.splitext(video_filename)
            output_filename = f"{base_filename}_narration.json"

            output_filepath = os.path.join(os.path.dirname(_file_), output_filename)

            with open(output_filepath, 'w') as f:
                json.dump(narration_data, f, indent=4)
            
            print(f"Narration script successfully saved to {output_filepath}")

            # Generate the final video with narration
            output_video_path = "backend/OUTPUT.mp4"
            await create_final_video(narration_data, request.video_path, output_video_path)

            response_data = {
                "narration_file_path": output_filepath,
                "final_video_path": output_video_path
            }
            return response_data
        except Exception as e:
            print(f"Error during video/audio creation: {e}")
            import traceback
            traceback.print_exc()
            return {"error": f"Failed during video/audio creation: {e}"}

        if 'narration' not in narration_data or not isinstance(narration_data['narration'], list):
            raise ValueError("Invalid JSON structure for narration")

        return narration_data
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


if _name_ == "_main_":
    uvicorn.run(app, host="0.0.0.0", port=8000)