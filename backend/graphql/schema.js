const { gql } = require('graphql-tag');

const typeDefs = gql`
  scalar JSON

  type Student {
    id: ID!
    name: String!
    rollNumber: String!
  }

  type StudentWithMarks {
    id: ID!
    name: String!
    rollNumber: String!
    marks: JSON
  }

  type UserToken {
    token: String!
  }

  type Query {
    getStudents: [Student]
    getStudentById(id: ID!): Student
    getMarks(studentId: ID!): JSON
    getAllStudentsWithMarks: [StudentWithMarks]
    downloadAllMarksBase64: String
  }

  type Mutation {
    register(username: String!, password: String!, role: String!): String
    login(username: String!, password: String!): String
    addStudent(name: String!, rollNumber: String!): String
    addMarks(studentId: ID!, marks: JSON!): String
    downloadMarksBase64(studentId: ID!): String
  }
`;

module.exports = typeDefs;