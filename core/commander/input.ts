const decoder = new TextDecoder();

export interface TypeMultipleInputOpts {
  // TODO
}

export class MultipleInput {
  // TODO
}

export interface TypeInputOpts {
  // TODO
  type: string;
  required: boolean;
  message: string;
  default: string|boolean|number;
}

export class Input {
  private _tip: string;
  constructor(tip: string = 'Please input something: ') {
    this._tip = tip;
  }

  public async listenInput(): Promise<string> {
    let result: string = '';
    return new Promise((resolve) => {
      while(1) {
        this._print(this._tip);
        const text: string = this._getInput();
        if (text.length > 0) {
          result = text;
          break;
        }
      }
      resolve(result);
    })
  }

  private _print(text: string): void {
    const encode = new TextEncoder();
    const chunk = encode.encode(`\x1b[0D \x1b[K ${text}`);
    Deno.stdout.writeSync(chunk);
  }

  private _getInput(maxLen: number = 64): string {
    const chunk = new Uint8Array(maxLen);
    const len: number = Deno.stdin.readSync(chunk) as number;
    let text: string = decoder.decode(chunk.slice(0, len));
    text = text.replace(/[\s]{1,}$/i, '');
    return text;
  }
}