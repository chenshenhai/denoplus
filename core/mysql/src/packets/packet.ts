import { byteFormat } from "../../deps.ts";
import { BufferReader, BufferWriter } from "../buffer.ts";
import { WriteError } from "../consttants/errors.ts";
import { debug, log } from "../logger.ts";

/** @ignore */
interface PacketHeader {
  size: number;
  no: number;
}

/** @ignore */
export class SendPacket {
  header: PacketHeader;

  constructor(readonly body: Uint8Array, no: number) {
    this.header = { size: body.length, no };
  }

  async send(conn: Deno.Conn) {
    const body = this.body as Uint8Array;
    const data = new BufferWriter(new Uint8Array(4 + body.length));
    data.writeUints(3, this.header.size);
    data.write(this.header.no);
    data.writeBuffer(body);
    log.debug(`send: ${data.length}B \n${byteFormat(data.buffer)}\n`);
    try {
      await conn.write(data.buffer);
    } catch (error) {
      throw new WriteError(error.message);
    }
  }
}

/** @ignore */
export class ReceivePacket {
  header: PacketHeader = { size: 0, no: 0 };
  body: BufferReader = new BufferReader(new Uint8Array(0));;
  type: "EOF" | "OK" | "ERR" | "RESULT" = "RESULT";

  async parse(reader: Deno.Reader): Promise<ReceivePacket|null> {
    const header = new BufferReader(new Uint8Array(4));
    let nread: number | Deno.EOF = await reader.read(header.buffer);
    if (!nread) return null;
    this.header = {
      size: header.readUints(3),
      no: header.readUint8()
    };
    this.body = new BufferReader(new Uint8Array(this.header.size));
    
    const readNread = await reader.read(this.body.buffer);
    if (typeof nread === 'number' && typeof readNread === 'number') {
      nread += readNread
    }

    switch (this.body.buffer[0]) {
      case 0x00:
        this.type = "OK";
        break;
      case 0xff:
        this.type = "ERR";
        break;
      case 0xfe:
        this.type = "EOF";
        break;
      default:
        this.type = "RESULT";
        break;
    }

    debug(() => {
      const data = new Uint8Array(nread as number);
      data.set(header.buffer);
      data.set(this.body.buffer, 4);
      log.debug(
        `receive: ${nread as number}B, size = ${this.header.size}, no = ${
          this.header.no
        } \n${byteFormat(data)}\n`
      );
    });

    return this;
  }
}
