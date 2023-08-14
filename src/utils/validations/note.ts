import { object, string, boolean, array, number } from "yup";

const noteListItem = object().shape({
  content: string().required().label("Content"),
  isCompleted: boolean().default(false).label("Is Completed"),
  order: number().required().label("Order"),
});

const noteList = object().shape({
  content: string().required().label("Content"),
  isCompleted: boolean().default(false).label("Is Completed"),
  order: number().required().label("Order"),
  hasItems: boolean().default(false).label("Has Items"),
  noteItemList: array()
    .of(noteListItem)
    .label("NoteItemList")
    .when("hasItems", {
      is: true,
      then: (schema) => schema.required().min(1),
    }),
});

const noteSchema = object()
  .shape({
    title: string().label("Title"),
    content: string().label("Content"),
    hasCheckBoxEnable: boolean().label("NoteList").default(false),
    imageUrls: array().of(string().url()).label("Images"),
    theme: string().label("Theme"),
    pined: boolean().label("Pined").default(false),
    noteList: array()
      .of(noteList)
      .when("hasCheckBoxEnable", {
        is: true,
        then: (schema) => schema.required().min(1),
      }),
  })
  .test(
    "titleOrContentRequired",
    "Either title or content is required when hasBoxEnable is false",
    function (value) {
      const { title, content, hasCheckBoxEnable } = value;
      if (!hasCheckBoxEnable && !title && !content) {
        return this.createError({
          path: "title",
          message:
            "Either Title or Content is required when hasCheckBoxEnable is false",
        });
      }
      return true;
    }
  );

export { noteSchema };
