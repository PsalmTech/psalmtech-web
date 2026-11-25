// Client reviews shown on the homepage.
// IMPORTANT: a review only appears on the live site when `approved: true`.
// Send each client their quote, then change `approved` to true once they say OK
// (and edit the wording if they ask for changes).

export type Review = { handle: string; role: string; quote: string; approved: boolean };

export const REVIEWS: Review[] = [
  {
    handle: "@Blessing",
    role: "Postgraduate researcher",
    quote:
      "PsalmTech Solutions guided my research on skin cancer detection using deep learning, from preparing the image data to training and evaluating the models. Every step was explained clearly, and I defended my work successfully.",
    approved: false,
  },
  {
    handle: "@Temidey_co",
    role: "Fashion & styling brand",
    quote:
      "PsalmTech brought real visibility to our business online. We trust them with our store analytics, and the insights help us understand our customers and plan better.",
    approved: false,
  },
  {
    handle: "@Charles_George",
    role: "Student",
    quote:
      "Their support made a real difference in my academics. Difficult topics became clear, and I always understood the reason behind each step of my analysis.",
    approved: false,
  },
  {
    handle: "@Oluwaseyi",
    role: "Freelance data analyst · former student",
    quote:
      "I learned data analytics with Power BI at PsalmTech. The training was practical from day one, and today I work as a freelance data analyst.",
    approved: false,
  },
  {
    handle: "@Garba_Bala",
    role: "Statistician",
    quote:
      "As a statistician, I am careful about who I recommend. Samuel’s work is rigorous and well documented, and I confidently refer clients to PsalmTech Solutions.",
    approved: false,
  },
];
