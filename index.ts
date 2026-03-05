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
 *   @is() accessor isSomeType: boolean;
 * }
 */
export function is() {
    return function <This extends Enum>(
        target: ClassAccessorDecoratorTarget<This, boolean>,
        context: ClassAccessorDecoratorContext<This, boolean>
    ): ClassAccessorDecoratorResult<This, boolean> {
        return {
            get() {
                const key = (context.name as string).slice(2);
                return this === (this.constructor as any)[key];
            },
        };
    };
}

/**
 * Decorator for enums that lets you make isNot attributes that reflect what state they are in.
 *
 * usage
 *
 * class Enum {
 *   static SomeType = new Enum('some_type');
 *
 *   @isNot() accessor isNotSomeType: boolean;
 * }
 */
export function isNot() {
    return function <This extends Enum>(
        target: ClassAccessorDecoratorTarget<This, boolean>,
        context: ClassAccessorDecoratorContext<This, boolean>
    ): ClassAccessorDecoratorResult<This, boolean> {
        return {
            get() {
                const key = (context.name as string).slice(5);
                return this !== (this.constructor as any)[key];
            },
        };
    };
}