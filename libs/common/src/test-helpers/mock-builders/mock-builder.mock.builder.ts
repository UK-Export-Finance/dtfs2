/**
 * Class to allow for the passing of jest fns into methods on the class object
 */
type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => infer R ? jest.Mock<R, Parameters<T[K]>> | T[K] : T[K];
};

/**
 * Base class for class test data and class builders.
 *
 * Pass in default values for the instance so that you can build an instance with
 * those values and override them as needed.
 *
 * @example
 * Overriding the defaults of a type:
 * ```ts
 * // user.mock.builder.ts
 * // Basic builder for a type
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
 * 
 * // a-test-file.test.ts
 * // Usage in a test where we just need a valid class instance
 * const user = new UserMockBuilder().build()
 * 
 * // another-test-file.test.ts
 * // Usage in a test where a field needs to have a specific value
 * const user = new UserMockBuilder()
 *   .with({ email: 'new.email@ukef.gov.uk' })
 *   .build()
 * ```

 *
 * @example
 * Overriding the defaults of a class:
 * ```ts
 * export class LoginServiceMockBuilder extends BaseMockBuilder<LoginService> {
 *   constructor() {
 *     super({
 *       defaultInstance: {
 *         getAuthCodeUrl: jest.fn(async () => {
 *           return Promise.resolve({
 *             authCodeUrl: 'a-auth-code-url',
 *             authCodeUrlRequest: {} as AuthorizationCodeRequest,
 *           });
 *         }),
 *       },
 *     });
 *   }
 * }
 * ```
 * 
 * Keeping existing implimentations of a class:
 * ```ts
 * export class UserServiceMockBuilder extends BaseMockBuilder<UserService> {
 *  constructor() {
 *    const userService = new UserService(); // This can be used as a way to inherit methods we do not wish to mock the implimentation for
 *    super({
 *      defaultInstance: {
 *        transformEntraIdUserToUpsertTfmUserRequest(entraIdUser: EntraIdUser): UpsertTfmUserRequest {
 *          return userService.transformEntraIdUserToUpsertTfmUserRequest(entraIdUser);
 *        },
 *        saveUserLoginInformation({ userId, sessionIdentifier, auditDetails }: saveUserLoginInformationParams): Promise<void> {
 *          return Promise.resolve();
 *        },
 *      },
 *    });
 *  }
 * ```
 */
export abstract class BaseMockBuilder<TClass extends object> {
  private readonly instance: Mocked<TClass> = {} as Mocked<TClass>;

  protected constructor(config: { defaultInstance: Mocked<TClass> }) {
    this.with(config.defaultInstance);
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

  /**
   * Build the class instance after setting any fields
   */
  public build(): TClass {
    return this.instance as TClass;
  }
}
