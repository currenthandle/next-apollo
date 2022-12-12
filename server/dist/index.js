import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const typeDefs = `#graphql
  type User {
    email: String!
    password: String!
    id: ID!
  }

  type UserNotFoundError {
    message: String!
  }

  union UserOrError = User | UserNotFoundError

  type Query {
    allUsers: [User!]!
    userByEmail(email: String!): User!
    validateUser(email: String!, password: String!): User
  }

  
  type Mutation {
    createUser(email: String!, password: String!): User!
    login(email: String!, password: String!): User!
  }
`;
console.log('resolvers!');
const resolvers = {
    Query: {
        async validateUser(_, { email, password }) {
            console.log('');
            console.log('');
            console.log('');
            console.log('email', email);
            console.log('email', typeof email);
            console.log('password', password);
            console.log('password', typeof password);
            const user = await prisma.user.findUnique({
                where: {
                    email,
                },
            });
            console.log('user before ', user);
            if (!user || user.password !== password) {
                console.log('about to resturn err');
                // const err = new Error('Invalid user or password');
                const err = { message: 'Invalid user or password' };
                console.log('err', err);
                // return false;
                return err;
            }
            return user;
        },
        allUsers: async () => {
            const users = await prisma.user.findMany();
            return users;
        },
        userByEmail: async (parent, { email }) => {
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            });
            return user;
        },
    },
    Mutation: {
        // a mutation resolver that creates a new user and adds it to the database
        async createUser(parent, args
        // context: AppContext,
        // info: GraphQLResolveInfo
        ) {
            const { email, password } = args;
            const user = await prisma.user.create({
                data: {
                    password,
                    email,
                },
            });
            return user;
        },
        async login(parent, args, context
        // info: GraphQLResolveInfo
        ) {
            // console.log('context', context);
            const { email, password } = args;
            console.log('email', email);
            console.log('password', password);
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        email,
                    },
                });
                console.log('user before ', user);
                if (!user) {
                    throw new Error('Invalid email or password');
                }
                if (user.password !== password) {
                    throw new Error('Invalid email or password');
                }
                console.log('user', user);
                // context.res.cookie('user', user, {
                //   httpOnly: true,
                //   maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
                // });
                // context.res.stausCode = 200;
                // context.res.end(user);
                return user;
            }
            catch (err) {
                console.log('err', err);
                throw new Error('Invalid email or password');
            }
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError, error) => {
        // unwrapResolverError removes the outer GraphQLError wrapping from
        // errors thrown in resolvers, enabling us to check the instance of
        // the original error
        return { message: 'Internal server error' };
    },
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 3001 },
    context: async ({ req, res }) => ({ res }),
});
console.log(`🚀  Server ready at: ${url}`);
