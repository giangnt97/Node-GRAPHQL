




/* DEFINE QUERY, MUTATION, SUBCRIPTION */
const {buildSchema} = require('graphql')

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }    


    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        post: [Post!]!
    }

    input PostData {
        title: String!
        content: String!
        imageUrl: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type AuthData {
        token: String! 
        userId: String!
    } 

    type RootQuery {
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostData): Post!
    }

    schema{
        query: RootQuery
        mutation: RootMutation
    }
`)