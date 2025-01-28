import readline from "readline"

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

export const readLineInterface = {
  getInput: (userInput): Promise<string> => {
    return new Promise((res) => {
      input.question(userInput, (answer) => {
        res(answer)
      })
    })
  },
  close: () => input.close()
}
