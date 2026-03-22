import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@ObjectType()
class AuthUser {
  @Field() userId!: string;
  @Field() userName!: string;
  @Field(() => [String]) roles!: string[];
}

@ObjectType()
class LoginResponse {
  @Field() accessToken!: string;
  @Field(() => AuthUser) user!: AuthUser;
}

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}
  @Mutation(() => LoginResponse)
  login(@Args('id') id: string, @Args('pw') pw: string) {
    return this.auth.login(id, pw);
  }

  @Mutation(() => LoginResponse)
  requestAthenaAccessToken(@Args('email') email: string, @Args('pw') pw: string) {
    return this.auth.requestAthenaAccessToken(email, pw);
  }

  @Mutation(() => LoginResponse)
  requestAthenaRefreshToken(@Args('refreshToken') refreshToken: string) {
    return this.auth.requestAthenaRefreshToken(refreshToken);
  }
}
