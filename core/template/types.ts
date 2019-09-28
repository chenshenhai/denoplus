
export interface TypeTemplate {
  getAST(): TypeTagAST|TypeTagAST[];
  compileToHTML(data: object): string;
}

export interface TypeTemplateUnit  {
  getAST(): TypeUnitAST
}

export enum TypeUnitASTPropType {
  TAG_START = "TAG_START",
  TAG_END = "TAG_END",
  TAG_NO_CLOSE = "TAG_NO_CLOSE",
  TEXT = "TEXT",
}

export interface TypeASTAttr {
  [key: string]: string|null|undefined;
}

export interface TypeASTDirect {
  [key: string]: string;
}

export interface TypeUnitAST {
  tagName: string;
  content: string;
  type: TypeUnitASTPropType;
  start: number;
  end: number;
  attributes: TypeASTAttr;
  directives: TypeASTDirect;
}

export interface TypeTagAST {
  tag: string | null;
  children: TypeTagAST[];
  text: string;
  attributes: TypeASTAttr;
  directives: TypeASTDirect;
}
