/*
    This dictates the 'enviornment' the project board is being used in, e.g. being used in the 'my projects' page
        versus an event gallery.

    MyProjects: Indicates that the ProjectBoard is being used in the 'My projects' page.
    EventGallery: Indicates that the ProjectBoard is being used as an event gallery (i.e. for a specific hackathon).
    etc etc etc...
    
    ProjectBoard behaves slightly differently depending on the context it is used in. For example, there is no 'Owner'
        or 'Lead' tab on the top-right of the project card when it's being used in the event gallery. Another example,
        the messages displayed when the list of projects being passed into the ProjectBoard are different depending on
        the context.
*/
export enum ProjectBoardContext {
    MyProjects,
    EventGallery
  }