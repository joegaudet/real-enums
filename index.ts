import { capitalize } from 'inflection';

export class Enum extends String {
    value: string;

    constructor(string: string) {
        super(string);
        this.value = string;
    }

    valueOf() {
        return this.value;
    }

    get id() {
        return this;
    }

    get label() {
        return capitalize(this.value);
    }

    static get values() {
        return Object.getOwnPropertyNames(this)
            // @ts-ignore
            .filter(key => this[key] instanceof this.prototype.constructor)
            // @ts-ignore
            .map(key => this[key]);
    }

    static valueFor(key: string) {
        // string ember need a squish compare.
        return this.values.find((_) => _.value === key);
    }
}

/**
 * Decorator for enums that lets you make is attributes that reflec what state they are in.
 *
 * usage
 *
 * class Enum {
 *   static SomeType = new Enum('some_type');
 *
 *   @is isSomeType;
 * }
 */
export function is() {
    return (target: any, key: string) => {
        Object.defineProperty(target, key, {
            get() {
                return this === target.constructor[key.slice(2)];
            },
        });
    };
}

/**
 * Decorator for enums that lets you make is attributes that reflec what state they are in.
 *
 * usage
 *
 * class Enum {
 *   static SomeType = new Enum('some_type');
 *
 *   @is isSomeType;
 * }
 */
export function isNot() {
    return (target: any, key: string) => {
        Object.defineProperty(target, key, {
            get() {
                return this !== target.constructor[key.slice(5)];
            }
        });
    };
}