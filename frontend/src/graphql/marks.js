import { gql } from '@apollo/client';

export const ADD_MARKS = gql`
  mutation AddMarks($studentId: ID!, $marks: JSON!) {
    addMarks(studentId: $studentId, marks: $marks)
  }
`;

export const GET_MARKS = gql`
  query GetMarks($studentId: ID!) {
    getMarks(studentId: $studentId)
  }
`;

export const GET_ALL_STUDENTS_WITH_MARKS = gql`
  query GetAllStudentsWithMarks {
    getAllStudentsWithMarks {
      id
      name
      rollNumber
      marks
    }
  }
`;

export const DOWNLOAD_MARKS = gql`
  mutation DownloadMarksBase64($studentId: ID!) {
    downloadMarksBase64(studentId: $studentId)
  }
`;

export const DOWNLOAD_ALL_MARKS = gql`
  query DownloadAllMarksBase64 {
    downloadAllMarksBase64
  }
`;
