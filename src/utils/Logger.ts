import * as colors from 'colors';


export class Logger {
    public static d(tag: string, msg: any, color?: string) {
        if (color) {
            console.log(tag, colors[color](msg))
        }
        else {

            console.log(tag, msg);
        }
    }

    public static e(tag: string, msg: string, err: any) {
        console.log(tag, msg, err);
    }
    /**will print nice buffer title */
    public static t(tag: string, msg: string, color?: string) {
        let b = '='.repeat(msg.length) + '==========================';
        let tl: number = tag.length;
        let space: string = ' '.repeat(tl + 1);
        if (color) {

            Logger.d(tag, `|${b}|\n${space}|============ ${msg} ============|\n${space}|${b}|\n`, color);


        }
        else {
            Logger.d(tag, `|${b}|\n${space}|============ ${msg} ============|\n${space}|${b}|\n`);
            
        }

    }
        /**will print nice small title */
        public static st(tag: string, msg: string, color?: string) {
            if (color) {
    
                console.log(tag,  colors[color](`|----------- ${msg} -----------|`));
            }
            else {
                console.log(tag, `|----------- ${msg} -----------|`);
            }
    
        }

}