import {readFileSync} from "fs"

const BASE_URL = "http://127.0.0.1:11434"
const CHAT_API = BASE_URL + "/api/chat"

import { Ollama, OllamaEmbeddings } from "@langchain/ollama";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"

import { createStuffDocumentsChain } from "langchain/chains/combine_documents"
import { PromptTemplate } from "@langchain/core/prompts"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { MemoryVectorStore } from "langchain/vectorstores/memory"

async function main() {

    const ollama = new Ollama({
        baseUrl: BASE_URL,
        model: "llama3",
      });

      const embedings = new OllamaEmbeddings()
    
    const loader = new CheerioWebBaseLoader("https://en.wikipedia.org/wiki/2023_Hawaii_wildfires");
    const data = await loader.load()
    console.log("page loaded")
    
    // Split the text into 500 character chunks. And overlap each chunk by 20 characters
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 20
       });
       const splitDocs = await textSplitter.splitDocuments(data);
       console.log("docs split", splitDocs.length)

    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embedings)
    // console.log("vector store", vectorStore)

    // const retriever = vectorStore.asRetriever();
    const question = "What are major mistakes happened during the 2023 Hawaii wild fire?";
    const docs = await vectorStore.similaritySearch(question);
    // console.log(...docs);

    // const response = await ollama.invoke(question)
    // console.log("response", response)

    //    const retriever = vectorStore.asRetriever();
    //    const chain = RetrievalQAChain.fromLLM(ollama, retriever);
    //    const result = await chain.call({query: "When was Hawaii's request for a major disaster declaration approved?"});
    //    console.log(result.text)
       
    const prompt = PromptTemplate.fromTemplate(
        "Summarize the main themes in these retrieved docs: {context}"
      );      
    const chain = await createStuffDocumentsChain({
        llm: ollama,
        prompt,
      });
      
      const out = await chain.invoke({
        context: docs,
      });
      console.log("out", out)

}

process.on('uncaughtException', function (err) {
    console.error("ERROR-uncaughtException", err);
  });   

main();
