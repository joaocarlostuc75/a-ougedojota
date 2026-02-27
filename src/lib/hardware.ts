/**
 * Hardware Integration Service
 * Uses Web Serial API for Scales and Web USB for Thermal Printers
 */

export class ScaleService {
  private port: any = null;
  private reader: any = null;
  private decoder = new TextDecoder();

  async connect() {
    try {
      // @ts-ignore
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      return true;
    } catch (error) {
      console.error('Failed to connect to scale:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.reader) {
      await this.reader.cancel();
      this.reader.releaseLock();
      this.reader = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }

  async readWeight(): Promise<number | null> {
    if (!this.port) return null;

    try {
      const writer = this.port.writable.getWriter();
      // Protocol for Toledo/Filizola: Send [ENQ] (0x05) to request weight
      await writer.write(new Uint8Array([0x05]));
      writer.releaseLock();

      this.reader = this.port.readable.getReader();
      const { value, done } = await this.reader.read();
      this.reader.releaseLock();
      this.reader = null;

      if (done) return null;

      const text = this.decoder.decode(value);
      // Example response: [STX]001.250[ETX] -> Extract 001.250
      const match = text.match(/\d+\.\d+/);
      return match ? parseFloat(match[0]) : null;
    } catch (error) {
      console.error('Error reading weight:', error);
      return null;
    }
  }

  // Mock for testing
  async mockReadWeight(): Promise<number> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(parseFloat((Math.random() * 2 + 0.5).toFixed(3)));
      }, 500);
    });
  }
}

export class PrinterService {
  private device: any = null;

  async connect() {
    try {
      // @ts-ignore
      this.device = await navigator.usb.requestDevice({
        filters: [{ classCode: 0xff }, { classCode: 0x07 }] // Generic printer filters
      });
      await this.device.open();
      await this.device.selectConfiguration(1);
      await this.device.claimInterface(0);
      return true;
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      return false;
    }
  }

  async print(data: Uint8Array) {
    if (!this.device) return;
    try {
      await this.device.transferOut(1, data);
    } catch (error) {
      console.error('Print error:', error);
    }
  }

  // Helper to format ESC/POS receipt
  formatReceipt(order: any) {
    const encoder = new TextEncoder();
    const esc = {
      init: [0x1B, 0x40],
      center: [0x1B, 0x61, 0x01],
      left: [0x1B, 0x61, 0x00],
      boldOn: [0x1B, 0x45, 0x01],
      boldOff: [0x1B, 0x45, 0x00],
      cut: [0x1D, 0x56, 0x00]
    };

    let commands: number[] = [...esc.init, ...esc.center, ...esc.boldOn];
    
    // Header
    commands.push(...Array.from(encoder.encode("MEATMASTER PRO\n")));
    commands.push(...esc.boldOff);
    commands.push(...Array.from(encoder.encode("Açougue & Churrascaria\n")));
    commands.push(...Array.from(encoder.encode("--------------------------------\n")));
    
    // Items
    commands.push(...esc.left);
    order.items.forEach((item: any) => {
      const line = `${item.name.padEnd(20)} ${item.quantity.toString().padStart(5)} ${item.unit}\n`;
      commands.push(...Array.from(encoder.encode(line)));
    });
    
    commands.push(...Array.from(encoder.encode("--------------------------------\n")));
    commands.push(...esc.boldOn);
    commands.push(...Array.from(encoder.encode(`TOTAL: R$ ${order.total.toFixed(2)}\n`)));
    commands.push(...esc.boldOff);
    commands.push(...Array.from(encoder.encode("\nObrigado pela preferência!\n\n\n")));
    commands.push(...esc.cut);

    return new Uint8Array(commands);
  }
}

export const scale = new ScaleService();
export const printer = new PrinterService();
