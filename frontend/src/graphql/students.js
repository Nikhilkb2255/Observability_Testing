import { gql } from '@apollo/client';

export const GET_STUDENTS = gql`
  query {
    getStudents {
      id
      name
      rollNumber
    }
  }
`;

export const ADD_STUDENT = gql`
  mutation AddStudent($name: String!, $rollNumber: String!) {
    addStudent(name: $name, rollNumber: $rollNumber)
  }
`;
