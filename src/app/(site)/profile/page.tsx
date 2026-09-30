import { redirect } from "next/navigation";

/** The account view lives on the portfolio page. */
export default function ProfilePage() {
  redirect("/portfolio");
}
