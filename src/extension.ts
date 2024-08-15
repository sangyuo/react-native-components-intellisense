/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from "vscode";
import {
  borderStylesType,
  CONFIG_GLOB,
  roundedStylesType,
  sizeStylesType,
} from "./constants";
import { DefaultTheme, getThemeConfig } from "./config";
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
  colorOptions: { [key: string | number]: string },
  completionItems: vscode.CompletionItem[],
  positionReplace?: vscode.Range
) => {
  for (const color in colorOptions) {
    const value = colorOptions[color];
    for (const keyword of keywordColor) {
      const label = `${keyword}-${color}`;
      const completionItem = new vscode.CompletionItem(
        label,
        vscode.CompletionItemKind.Color
      );
      if (positionReplace) {
        completionItem.range = {
          inserting: positionReplace,
          replacing: positionReplace,
        };
      }
      completionItem.detail = value;
      completionItem.documentation = new vscode.MarkdownString(
        `Color: ${value}`
      );
      completionItems.push(completionItem);
    }
  }
};

const generalCompletionItemProperty = (
  stylesOptions: { [key: string | number]: string | number },
  propertiesOptions: { [key: string | number]: string | number },
  completionItems: vscode.CompletionItem[],
  positionReplace?: vscode.Range
) => {
  for (const options in stylesOptions) {
    const value = stylesOptions[options];
    for (const property in propertiesOptions) {
      const label = options === "default" ? property : `${property}-${options}`;
      const completionItem = new vscode.CompletionItem(
        label,
        vscode.CompletionItemKind.Enum
      );
      if (positionReplace) {
        completionItem.range = {
          inserting: positionReplace,
          replacing: positionReplace,
        };
      }
      const keyStyle = propertiesOptions[property]?.toString();
      const keysStyle = keyStyle.split(" ");
      let description = "";
      keysStyle?.forEach((item) => {
        description += `${item}: ${value}${
          typeof value === "number" ? "px" : ""
        }\n`;
      });
      completionItem.detail = description;
      completionItems.push(completionItem);
    }
  }
};

const initCompletionItem = (
  completionItems: vscode.CompletionItem[],
  themeConfig: DefaultTheme
) => {
  generalCompletionItemColor(themeConfig.colors, completionItems);
  generalCompletionItemProperty(
    themeConfig.space.size,
    sizeStylesType,
    completionItems
  );
  generalCompletionItemProperty(
    themeConfig.space.text,
    { text: "fontSize" },
    completionItems
  );
  generalCompletionItemProperty(
    themeConfig.space["line-height"],
    { "line-height": "lineHeight" },
    completionItems
  );
  generalCompletionItemProperty(
    themeConfig.space.rounded,
    roundedStylesType,
    completionItems
  );
  generalCompletionItemProperty(
    themeConfig.space.border,
    borderStylesType,
    completionItems
  );
  for (const key in keyStyles) {
    const item = keyStyles[key];
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
};

export async function activate(context: vscode.ExtensionContext) {
  const folders = vscode.workspace.workspaceFolders;
  let completionItems: vscode.CompletionItem[] = [];
  let configFiles = null;
  if (folders) {
    configFiles = await vscode.workspace.findFiles(
      new vscode.RelativePattern(folders[0], `**/${CONFIG_GLOB}`),
      null,
      1
    );
  }
  async function getKeywordConfig(uriFolder: vscode.Uri) {
    try {
      const dataConfig = await vscode.workspace.openTextDocument(uriFolder);
      const dataText = dataConfig.getText();
      const jsonStringMatch = dataText.split(/module\.exports\s*=\s*/);
      if (jsonStringMatch) {
        const jsonString = jsonStringMatch[1]
          .replace(";", "")
          .replace(/'/g, '"')
          .replace(/,\s*([\]}])/g, "$1")
          .replace(/(\w+):/g, '"$1":');
        return JSON.parse(jsonString);
      }
      return {};
    } catch (error) {
      console.log("error", uriFolder, error);

      return {};
    }
  }
  let keywordByConfig = configFiles && (await getKeywordConfig(configFiles[0]));
  let themeConfig: DefaultTheme = getThemeConfig(keywordByConfig);
  initCompletionItem(completionItems, themeConfig);
  let configWatcher = vscode.workspace.createFileSystemWatcher(
    `**/${CONFIG_GLOB}`,
    false,
    false,
    true
  );

  async function foreUpdateCompletion(uriFolder: vscode.Uri) {
    keywordByConfig = await getKeywordConfig(uriFolder);
    themeConfig = getThemeConfig(keywordByConfig);
    completionItems = [];
    initCompletionItem(completionItems, themeConfig);
  }
  configWatcher.onDidCreate(async (e) => {
    await foreUpdateCompletion(e);
  });
  configWatcher.onDidChange(async (e) => {
    await foreUpdateCompletion(e);
  });

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
          completionItems = completionItems.map((item) => {
            return {
              ...item,
              range: {
                inserting: rangeStart,
                replacing: rangeStart,
              },
            };
          });
          return completionItems;
        }
        return [];
      },
    }
  );
  context.subscriptions.push(provider);
}
