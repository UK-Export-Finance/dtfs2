/**
 * Class to allow for the passing of jest fns into methods on the class object
 */
type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R ? jest.Mock<R, Parameters<T[K]>> | T[K] : T[K];
};

/**
 * Base class for class test data builders. Pass in default values for the class
 * instance so that you can build an instance with those values and override
 * them as needed.
 *
 * @example
 * ```ts
 * // Basic builder
 * export class UserMockBuilder extends BaseMockBuilder<User> {
 *   constructor() {
 *     super({
 *       defaultInstance: {
 *         id: '72f9ca55-943a-401d-a04c-0a9e03ac7f18',
 *         name: 'Joe Bloggs',
 *         email: 'joe.bloggs@ukef.gov.uk',
 *       },
 *     })
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // With custom static factory methods to initialise the builder
 * export class UserMockBuilder extends BaseMockBuilder<User> {
 *   constructor(defaultInstance?: User) {
 *     super({
 *       defaultInstance: defaultInstance ?? {
 *         id: '72f9ca55-943a-401d-a04c-0a9e03ac7f18',
 *         name: 'Joe Bloggs',
 *         email: 'joe.bloggs@ukef.gov.uk',
 *       },
 *     })
 *   }
 *
 *   public static fromEntity(entity: UserEntity): UserMockBuilder {
 *     return new UserMockBuilder({
 *       id: entity.id,
 *       name: entity.name,
 *       email: entity.email,
 *     })
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * // Usage in a test where we just need a valid class instance
 * const user = new UserMockBuilder().build()
 * ```
 *
 * @example
 * ```ts
 * // Usage in a test where a field needs to have a specific value
 * const user = new UserMockBuilder()
 *   .with({ email: 'new.email@ukef.gov.uk' })
 *   .build()
 * ```
 */
export abstract class BaseMockBuilder<TClass extends object> {
  private readonly defaults: Partial<Mocked<TClass>>;
  private readonly instance: Mocked<TClass> = {} as Mocked<TClass>;

  protected constructor(config: { defaultInstance: Partial<Mocked<TClass>> }) {
    this.defaults = config.defaultInstance;
  }

  /**
   * Set fields on the class instance when you want to override the defaults
   *
   * @example
   * ```ts
   * const user = new UserMockBuilder()
   *   .with({
   *     email: 'new.email@ukef.gov.uk',
   *     givenName: 'Fred',
   *   })
   *   .build()
   * ```
   */
  public with(values: Partial<Mocked<TClass>>): BaseMockBuilder<TClass> {
    Object.assign(this.instance, values);
    return this;
  }

  public withDefaults(): BaseMockBuilder<TClass> {
    return this.with(this.defaults);
  }

  /**
   * Build the class instance after setting any fields
   */
  public build(): TClass {
    return this.instance as TClass;
  }
}
