'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

//   const sendMessage = async () => {
//     if (!message.trim() || isLoading) return;
//     setIsLoading(true) // Don't send empty messages

//     setMessage('')  // Clear the input field
//     setMessages((messages) => [
//       ...messages,
//       { role: 'user', content: message },  // Add the user's message to the chat
//       { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
//     ])

//     try {
//         const response = await fetch('/api/chat', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify([...messages, { role: 'user', content: message }]),
//         })
    
//         if (!response.ok) {
//           throw new Error('Network response was not ok')
//         }
    
//         const reader = completion.body?.getReader();
//         if (!reader) throw new Error('Failed to get reader from response body');
//         const decoder = new TextDecoder()
    
//         // while (true) {
//         //   const { done, value } = await reader.read()
//         //   if (done) break
//         //   const text = decoder.decode(value, { stream: true })
//         //   setMessages((messages) => {
//         //     let lastMessage = messages[messages.length - 1]
//         //     let otherMessages = messages.slice(0, messages.length - 1)
//         //     return [
//         //       ...otherMessages,
//         //       { ...lastMessage, content: lastMessage.content + text },
//         //     ]
//         //   })
//         // }
//         while (true) {
//             const { done, value } = await reader.read();
//             if (done) break;
//             const content = value.choices[0]?.delta?.content; // Extract content from the chunk
//             if (content) {
//               const text = encoder.encode(content); // Encode the content to Uint8Array
//               controller.enqueue(text); // Enqueue the encoded text to the stream
//             }
//           }
//       } catch (error) {
//         console.error('Error:', error)
//         setMessages((messages) => [
//           ...messages,
//           { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
//         ])
//       }
//       setIsLoading(false)
//   }

const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true); // Don't send empty messages
  
    setMessage(''); // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message }, // Add the user's message to the chat
      { role: 'assistant', content: '' }, // Add a placeholder for the assistant's response
    ]);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get reader from response body');
      const decoder = new TextDecoder();
      
      let content = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true }); // Accumulate content
      }
  
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + content },
        ];
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
  
const messagesEndRef = useRef(null)

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}

useEffect(() => {
  scrollToBottom()
}, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
        >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}