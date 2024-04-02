/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
const keyStyles = require("../snippets/snippets-react-native-box.json");
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
          new vscode.Range(new vscode.Position(position.line, 0), position)
        );
        let completionItems: any[] = [];
        if (lineUntilPos && lineUntilPos.length) {
          if (lineUntilPos?.includes("className")) {
            for (const key in keyStyles) {
              const item: {
                prefix: string;
                description: string;
                color?: string;
              } = keyStyles[key];
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
        if (!completionItems.length) {
          return undefined;
        }
        return [...completionItems];
      },
    }
  );
  context.subscriptions.push(provider);
}
