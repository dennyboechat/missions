"use client";

// Types
import { ProjectUser } from "../types/ProjectUserTypes";

// Utils
import { getParsedCharacterText } from "./getParsedCharacterText";

export const getFilteredProjectUsers = ({
  projectUsers,
  filterText,
}: {
  projectUsers: ProjectUser[];
  filterText?: string;
}): ProjectUser[] => {
  let sortedProjectUsers: ProjectUser[] = [];
  if (projectUsers && projectUsers.length) {
    if (filterText && filterText.length) {
      projectUsers.forEach((projectUser) => {
        if (
          getParsedCharacterText({
            text: projectUser.userName,
          }).startsWith(filterText.toLowerCase())
        ) {
          projectUser.filterOrder = 1;
          sortedProjectUsers.push(projectUser);
        } else if (
          getParsedCharacterText({
            text: projectUser.userName,
          }).includes(filterText.toLowerCase())
        ) {
          projectUser.filterOrder = 2;
          sortedProjectUsers.push(projectUser);
        } else if (
          getParsedCharacterText({
            text: projectUser.userEmail,
          }).includes(filterText.toLowerCase())
        ) {
          projectUser.filterOrder = 3;
          sortedProjectUsers.push(projectUser);
        }
      });
      sortedProjectUsers.sort(
        (a, b) => (a.filterOrder ?? 0) - (b.filterOrder ?? 0)
      );
    } else {
      sortedProjectUsers = projectUsers;
    }
  }

  return sortedProjectUsers;
};
