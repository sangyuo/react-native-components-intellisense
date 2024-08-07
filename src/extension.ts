/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
import {
  BORDER_RADIUS,
  BORDER_WIDTH,
  borderStylesType,
  COLORS,
  LINE_HEIGHT_SIZE,
  roundedStylesType,
  SIZE_SPACE,
  sizeStylesType,
  TEXT_SIZE,
} from "./constants";
interface KeyStyles {
  prefix: string;
  description: string;
  color?: string;
}
const keyStyles: KeyStyles[] = require("../snippets/snippets-react-native-box.json");
const regexStart = /(class\w*=\s*\{[^}]*$)/g;
const regexStartB = /(class\w*=\s*\"[^"]*$)/g;

const keywordBorder = [
  "border",
  "border-t",
  "border-l",
  "border-r",
  "border-x",
  "border-y",
  "shadow",
];
const keywordColor = ["bg", "text", ...keywordBorder];

const generalCompletionItemColor = (
  completionItems: vscode.CompletionItem[],
  positionReplace: vscode.Range
) => {
  for (const color in COLORS) {
    const value = COLORS[color as keyof typeof COLORS];
    for (const keyword of keywordColor) {
      const label = `${keyword}-${color}`;
      const completionItem = new vscode.CompletionItem(
        label,
        vscode.CompletionItemKind.Color
      );
      completionItem.range = {
        inserting: positionReplace,
        replacing: positionReplace,
      };
      completionItem.detail = value;
      completionItem.documentation = new vscode.MarkdownString(
        `Color: ${value}`
      );
      completionItems.push(completionItem);
    }
  }
};

const generalCompletionItemProperty = (
  stylesOptions: { [key: string]: string },
  propertiesOptions: { [key: string]: string },
  completionItems: vscode.CompletionItem[],
  positionReplace: vscode.Range
) => {
  for (const options in stylesOptions) {
    const value = stylesOptions[options];
    for (const property in propertiesOptions) {
      const label = options === "default" ? property : `${property}-${options}`;
      const completionItem = new vscode.CompletionItem(
        label,
        vscode.CompletionItemKind.Enum
      );
      completionItem.range = {
        inserting: positionReplace,
        replacing: positionReplace,
      };
      const keyStyle = propertiesOptions[property]?.toString();
      const keysStyle = keyStyle.split(" ");
      let description = "";
      keysStyle?.forEach((item) => {
        description += `${item}: ${value}\n`;
      });
      completionItem.detail = description;
      completionItems.push(completionItem);
    }
  }
};

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
          new vscode.Range(new vscode.Position(0, 0), position)
        );
        let completionItems: any[] = [];
        const linePrefix = document
          .lineAt(position)
          .text.substring(0, position.character);
        const endText = linePrefix.match(/\w+(-\w+)?-?$/g);
        if (
          lineUntilPos?.match(regexStart) ||
          lineUntilPos?.match(regexStartB)
        ) {
          const positionStart = new vscode.Position(
            position.line,
            position.character - (endText?.[0]?.length ?? 0)
          );
          const rangeStart = new vscode.Range(positionStart, position);
          generalCompletionItemColor(completionItems, rangeStart);
          generalCompletionItemProperty(
            SIZE_SPACE,
            sizeStylesType,
            completionItems,
            rangeStart
          );
          generalCompletionItemProperty(
            TEXT_SIZE,
            { text: "fontSize" },
            completionItems,
            rangeStart
          );
          generalCompletionItemProperty(
            LINE_HEIGHT_SIZE,
            { "line-height": "lineHeight" },
            completionItems,
            rangeStart
          );
          generalCompletionItemProperty(
            BORDER_RADIUS,
            roundedStylesType,
            completionItems,
            rangeStart
          );
          generalCompletionItemProperty(
            BORDER_WIDTH,
            borderStylesType,
            completionItems,
            rangeStart
          );
          for (const key in keyStyles) {
            const item = keyStyles[key];
            if (!endText || item.prefix.startsWith(endText[0])) {
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
