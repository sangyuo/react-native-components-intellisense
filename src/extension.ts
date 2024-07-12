/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
interface KeyStyles {
  prefix: string;
  description: string;
  color?: string;
}
const keyStyles:KeyStyles[] = require("../snippets/snippets-react-native-box.json");
const regexClass = /class\w+=/g;

function isBalancedClassString(classString:string) {
  if(classString) {
      const brackets = classString.split(regexClass);
      if (brackets) {
        const endString = brackets[brackets.length - 1].match(/[/"/]/g);
        console.log("endString",endString);
        if (endString) {
          return  endString.length === 0 || endString.length % 2 === 0;
        }
      }
  }
  return true;
}

export async function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerCompletionItemProvider(
    [
      { language: "javascript", scheme: "file" },
      { language: "typescript", scheme: "file" },
      { language: "typescriptreact", scheme: "file" },
    ],
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        let lineUntilPos = document.getText(
          new vscode.Range(new vscode.Position(Math.max(position.line-2, 0), 0), position)
        );
        let completionItems: any[] = [];
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        const endText = linePrefix.match(/\w+-?$/g);
        if (lineUntilPos?.includes("class") && !isBalancedClassString(lineUntilPos)) {
          for (const key in keyStyles) {
            const item = keyStyles[key];
            if(!endText || item.prefix.startsWith(endText[0]) ){
              const completionItem = new vscode.CompletionItem(
                item.prefix,
                item.color
                  ? vscode.CompletionItemKind.Color
                  : vscode.CompletionItemKind.Enum
              );
              if (item.color) {
                completionItem.documentation = new vscode.MarkdownString(
                  `Color: ${item.color}`
                );
              }
              completionItem.detail = item.description;
              completionItems.push(completionItem);
            }
          }
        }
        return [...completionItems];
      },
    }
  );
  context.subscriptions.push(provider);
}
