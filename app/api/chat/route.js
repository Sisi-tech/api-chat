import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import { OpenAI } from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 'Welcome to HeadstarterAI Support! How can I assist you today?';


// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request


  // Create a chat completion request to the OpenAI API
//   const completion = await openai.chat.completions.create({
//     messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
//     model: 'gpt-3.5-turbo', // Specify the model to use
//     stream: true, // Enable streaming responses
//   })
try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, ...data],
      model: 'gpt-3.5-turbo', // Or another model available in your plan
      stream: true,
    });
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limit exceeded. Check your quota and billing details.');
    } else {
      console.error('An error occurred:', error);
    }
  }
  

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}

// import { NextResponse } from 'next/server';
// import axios from 'axios';

// const systemPrompt = 'Welcome to HeadstarterAI Support! How can I assist you today?';

// export async function POST(req) {
//   const data = await req.json();
//   const text = `${systemPrompt}\n${data.text}`;

//   try {
//     // Replace with your actual Inference Endpoint URL
//     const endpointUrl = 'https://YOUR_INFERENCE_ENDPOINT_URL';

//     const response = await axios.post(
//       endpointUrl,
//       { inputs: text },
//       {
//         headers: {
//           'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const generatedText = response.data[0]?.generated_text || 'No response from GPT-J';

//     const stream = new ReadableStream({
//       async start(controller) {
//         const encoder = new TextEncoder();
//         try {
//           const textEncoded = encoder.encode(generatedText);
//           controller.enqueue(textEncoded);
//         } catch (err) {
//           controller.error(err);
//         } finally {
//           controller.close();
//         }
//       },
//     });

//     return new NextResponse(stream);
//   } catch (error) {
//     console.error('An error occurred:', error);
//     return new NextResponse('An error occurred during text generation.', { status: 500 });
//   }
// }
