import os
import asyncio
from dotenv import load_dotenv
from main import process_video, generate_narration, NarrationRequest


def test_the_function():
    # The process_video function expects the video to be in the backend directory
    video_file = os.path.join('backend', 'neuralnet.mp4')

    if not os.path.isfile(video_file):
        print(f"ERROR: Video file not found at '{video_file}'")
        print("Please make sure you have placed 'neuralnet.mp4' inside the 'backend' directory.")
        return

    print(f"Found video file. Testing 'process_video' function with '{video_file}'...")

    try:
        # Call the function with a higher seconds_per_frame to make the test quick
        frames, timestamps = process_video(video_path=video_file, seconds_per_frame=5)

        print("\n--- TEST RESULTS ---")
        print(frames)
        print(f"Function executed successfully.")
        print(f"Number of frames extracted: {len(frames)}")
        print(f"Number of timestamps generated: {len(timestamps)}")
        
        if frames:
            print(f"First timestamp: {timestamps[0]} seconds")
            print(f"Length of the first base64 encoded frame: {len(frames[0])}")
            print("Test PASSED.")
        elif not frames and os.path.getsize(video_file) > 0:
             print("Test FAILED: No frames were extracted from the video.")
        else:
             print("Test PASSED: 0 frames extracted from an empty or invalid video.")


    except Exception as e:
        print(f"\n--- TEST FAILED ---")
        print(f"An error occurred while running process_video: {e}")
        import traceback
        traceback.print_exc()

async def test_narration_endpoint():
    print("\n--- TESTING FINAL VIDEO CREATION ---")
    
    dotenv_path = os.path.join(os.path.dirname(_file_), '..', '.env') 
    load_dotenv(dotenv_path=dotenv_path)

    if not os.getenv("OPENAI_API_KEY") or not os.getenv("ELEVENLABS_API_KEY"):
        print("ERROR: API key not found.")
        if not os.getenv("OPENAI_API_KEY"):
            print("- Please add OPENAI_API_KEY to your .env file.")
        if not os.getenv("ELEVENLABS_API_KEY"):
            print("- Please add ELEVENLABS_API_KEY to your .env file.")
        return
    
    video_file = os.path.join('backend', 'neuralnet.mp4')
    if not os.path.isfile(video_file):
        print(f"ERROR: Video file not found at '{video_file}'")
        return

    try:
        request = NarrationRequest(
            video_path=video_file,
            prompt="a video about reflection and refraction of light"
        )
        
        print(f"Generating narration for '{request.prompt}'...")
        
        narration_result = await generate_narration(request)
        
        print("\n--- FINAL VIDEO RESULTS ---")
        if "error" in narration_result:
            print(f"An error occurred: {narration_result['error']}")
            print("Test FAILED.")
        else:
            print("Final video generation process completed successfully!")
            print(f"Narration script saved to: {narration_result.get('narration_file_path')}")
            print(f"Final synchronized video saved to: {narration_result.get('final_video_path')}")
            print("Test PASSED.")

    except Exception as e:
        print(f"\n--- NARRATION TEST FAILED ---")
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if _name_ == "_main_":
    asyncio.run(test_narration_endpoint())