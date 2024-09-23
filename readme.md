# LLM to LLM Conversation Example

The **chat** endpoint, available as of v0.1.14, is one of two ways to generate text from an LLM with Ollama. At a high level, you provide the endpoint an array of message objects with a role and content specified. Then with each output and prompt, you add more messages, which builds up the history.

This application provides system prompts for each of 2 characters having a conversation. See the examples directory for 5 different test models.

current_role is the first speaker
user_input is the first speakers first statement
iterations (seen in test.5.json) can be used to define the number of statements that will be requested.

## Run the Example

`npm start`

`npm start examples/test.1.json` 

## Pre-requisites

The ollama service running and available on localhost. llama3 model installed
