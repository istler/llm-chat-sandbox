
import {readFileSync} from "fs"

const CHAT_API = "http://127.0.0.1:11434/api/chat"
const DEFAULT_ITERATIONS = 5

type Message = {
  role: "assistant" | "user" | "system";
  content: string;
  activeRole?: string;
}

process.on('uncaughtException', function (err) {
  console.error("ERROR-uncaughtException", err);
}); 

class ConversationManager {
    constructor(model: string, iterations: number) {
        if (model)
            this.model = model
        if (iterations)
            this.iterations = iterations
    }
    messageList : Message[] = []
    systemMessage = {}
    model = "llama3"
    iterations = DEFAULT_ITERATIONS
    async chat(messages: Message[]): Promise<Message> {

        const body = {
          model: this.model,
          messages: messages,
          stream: false
        }

        const response = await fetch(CHAT_API, {
          method: "POST",
          body: JSON.stringify(body)
        }).catch((error) => {
         // Your error is here!
         console.error("ERROR", CHAT_API, error)
       });

        const json = await response.json()
        // console.log("[response]", json.message.content)
        return { role: "assistant", content: json.message.content };
      }

      async converse(tRole: string, user_input: string) {
        let maxMessages = this.iterations
        let messageCount = 0
        let currentRole: string = tRole
        console.log("converse()")
        while (messageCount++ < maxMessages) {
            console.log("")

            const otherRole = this.getOtherRole(currentRole)
            let inp: string
            if (this.messageList.length>0) {
                inp = this.messageList[this.messageList.length-1].content
            } else {
                inp = user_input
            }

            console.log("[" + currentRole + "]", ":", inp)
            const msg : Message = { role: "user", content: inp, activeRole: currentRole }

            const chatMessages : Message[] = [
                { role: "system", content: this.systemMessage[otherRole]},
                ...this.messageList,
                msg
            ]

            const response = await this.chat(chatMessages)

            this.messageList.push(response)
            
            // Invert role: user/assistant
            const newMessageList : Message[] = this.messageList.map(message => {
                return {
                    role: message.role == "user" ? "assistant" : "user",
                    content: message.content,
                    activeRole: message.role == "user" ? currentRole : otherRole
                }
            })
            this.messageList = newMessageList

            currentRole = this.getOtherRole(currentRole)
        }

      }

      getOtherRole(role: string) {
        const roles = Object.keys(this.systemMessage)
        const idx = roles.indexOf(role)
        if (idx == 0) {
            return roles[1]
        }
        return roles[0]
      }

      createSystemMessage(role: string, message: string) {
        this.systemMessage[role] = message
      }
}

async function main() {

    let input = "input.json";
    if (process.argv.length > 2) {
        input = process.argv[2]
    }
    const buffer = readFileSync(input)
    const params = JSON.parse(buffer)

    const c = new ConversationManager(params.model, params.iterations)
    c.createSystemMessage(params["actor1"], params["actor1.system"] )
    c.createSystemMessage(params["actor2"], params["actor2.system"] )

   await c.converse(params["current_role"], params['user_input'])

}

main();
