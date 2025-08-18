type ClassValue = string | boolean | null | undefined | { [key: string]: boolean } | ClassValue[]

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = []

  inputs.forEach((input) => {
    if (typeof input === "string" && input.trim() !== "") {
      classes.push(input.trim())
    } else if (typeof input === "object" && input !== null) {
      if (Array.isArray(input)) {
        classes.push(cn(...input)) // Đệ quy cho mảng
      } else {
        for (const key in input) {
          if (input[key]) {
            classes.push(key.trim())
          }
        }
      }
    }
  })

  return classes.filter(Boolean).join(" ")
}
