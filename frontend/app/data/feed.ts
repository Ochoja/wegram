export interface FeedComment {
  id: number;
  username: string;
  userImage: string;
  content: string;
  time: string; // ISO 8601 timestamp
}

export interface FeedItem {
  id: number;
  username: string;
  userImage: string;
  time: string; // ISO 8601 timestamp
  content: string;
  image?: string;
  likes: number;
  likedBy: string[];
  comments: FeedComment[];
  saves: number;
  isSaved: boolean;
  shares: number;
  location?: string;
}

export const feedData: FeedItem[] = [
  {
    id: 1,
    username: "Alice",
    userImage: "/avatars/alice.png",
    time: "2024-06-10T14:20:00Z",
    content: "Just joined WEGRAM! Excited to connect with everyone 🎉",
    image: "/posts/welcome.jpg",
    likes: 34,
    likedBy: ["Bob", "Charlie", "Diana"],
    comments: [
      {
        id: 1,
        username: "Bob",
        userImage: "/avatars/bob.png",
        content: "Welcome Alice! 🚀",
        time: "2024-06-10T15:00:00Z"
      },
      {
        id: 2,
        username: "Diana",
        userImage: "/avatars/diana.png",
        content: "Glad to have you here!",
        time: "2024-06-10T15:10:00Z"
      }
    ],
    saves: 5,
    isSaved: false,
    shares: 2,
    location: "New York, USA"
  },
  {
    id: 2,
    username: "Bob",
    userImage: "/avatars/bob.png",
    time: "2024-06-10T13:45:00Z",
    content: "Exploring Web3 and loving the community vibes! 🚀",
    image: "/posts/web3.png",
    likes: 21,
    likedBy: ["Alice", "Charlie"],
    comments: [
      {
        id: 1,
        username: "Charlie",
        userImage: "/avatars/charlie.png",
        content: "Web3 is the future!",
        time: "2024-06-10T14:00:00Z"
      }
    ],
    saves: 3,
    isSaved: true,
    shares: 1,
    location: "Berlin, Germany"
  },
  {
    id: 3,
    username: "Diana",
    userImage: "/avatars/diana.png",
    time: "2024-06-10T13:30:00Z",
    content: "Check out this amazing sunset! 🌅",
    image: "/posts/sunset.jpg",
    likes: 15,
    likedBy: ["Alice", "Bob"],
    comments: [],
    saves: 2,
    isSaved: false,
    shares: 0,
    location: "Santorini, Greece"
  },
  {
    id: 4,
    username: "Charlie",
    userImage: "/avatars/charlie.png",
    time: "2024-06-10T12:50:00Z",
    content: "Had a great time at the blockchain meetup today!",
    image: "/posts/meetup.jpg",
    likes: 18,
    likedBy: ["Alice", "Diana"],
    comments: [
      {
        id: 1,
        username: "Alice",
        userImage: "/avatars/alice.png",
        content: "Wish I could have joined!",
        time: "2024-06-10T13:00:00Z"
      }
    ],
    saves: 4,
    isSaved: false,
    shares: 1,
    location: "London, UK"
  },
  {
    id: 5,
    username: "Eve",
    userImage: "/avatars/eve.png",
    time: "2024-06-10T12:10:00Z",
    content: "Started learning Solidity today. Any tips?",
    likes: 12,
    likedBy: ["Bob", "Charlie"],
    comments: [
      {
        id: 1,
        username: "Bob",
        userImage: "/avatars/bob.png",
        content: "Start with the basics and build small projects!",
        time: "2024-06-10T12:20:00Z"
      }
    ],
    saves: 1,
    isSaved: false,
    shares: 0,
    location: "Toronto, Canada"
  },
  {
    id: 6,
    username: "Frank",
    userImage: "/avatars/frank.png",
    time: "2024-06-10T11:40:00Z",
    content: "Who's up for a gaming session tonight? 🎮",
    image: "/posts/gaming.jpg",
    likes: 20,
    likedBy: ["Alice", "Eve"],
    comments: [
      {
        id: 1,
        username: "Eve",
        userImage: "/avatars/eve.png",
        content: "Count me in!",
        time: "2024-06-10T11:50:00Z"
      }
    ],
    saves: 2,
    isSaved: true,
    shares: 2,
    location: "Seoul, South Korea"
  },
  {
    id: 7,
    username: "Grace",
    userImage: "/avatars/grace.png",
    time: "2024-06-10T11:00:00Z",
    content: "Reading the latest whitepaper on decentralized finance.",
    image: "/posts/defi.jpg",
    likes: 9,
    likedBy: ["Frank", "Diana"],
    comments: [],
    saves: 3,
    isSaved: false,
    shares: 1,
    location: "Zurich, Switzerland"
  },
  {
    id: 8,
    username: "Henry",
    userImage: "/avatars/henry.png",
    time: "2024-06-10T10:30:00Z",
    content: "Livestreaming my coding session in 30 minutes! Join me!",
    likes: 16,
    likedBy: ["Grace", "Alice"],
    comments: [
      {
        id: 1,
        username: "Grace",
        userImage: "/avatars/grace.png",
        content: "I'll be there!",
        time: "2024-06-10T10:40:00Z"
      }
    ],
    saves: 2,
    isSaved: false,
    shares: 3,
    location: "San Francisco, USA"
  },
  {
    id: 9,
    username: "Ivy",
    userImage: "/avatars/ivy.png",
    time: "2024-06-10T09:50:00Z",
    content: "AI is changing the world. What are your thoughts?",
    image: "/posts/ai.jpg",
    likes: 22,
    likedBy: ["Henry", "Grace"],
    comments: [
      {
        id: 1,
        username: "Henry",
        userImage: "/avatars/henry.png",
        content: "Absolutely! It's fascinating.",
        time: "2024-06-10T10:00:00Z"
      }
    ],
    saves: 5,
    isSaved: true,
    shares: 2,
    location: "Tokyo, Japan"
  },
  {
    id: 10,
    username: "Jaqueline",
    userImage: "/avatars/jaqueline.png",
    time: "2024-06-10T09:00:00Z",
    content: "Just finished a marathon! 🏃‍♂️",
    image: "/posts/marathon.jpg",
    likes: 30,
    likedBy: ["Ivy", "Frank"],
    comments: [
      {
        id: 1,
        username: "Frank",
        userImage: "/avatars/frank.png",
        content: "Congrats Jaqueline! That's awesome.",
        time: "2024-06-10T09:10:00Z"
      }
    ],
    saves: 6,
    isSaved: false,
    shares: 4,
    location: "Boston, USA"
  }
];


/**
 * Returns a human-readable string representing the time difference
 * between the given ISO time string and the current time.
 * Examples: "just now", "5s ago", "3m ago", "2h ago", "4d ago", "1w ago", "2y ago"
 * @param {string} isoTime - ISO 8601 time string
 * @returns {string}
 */
export function timeAgo(isoTime: string): string {
  const now = new Date();
  const then = new Date(isoTime);
  const diffMs = now.getTime() - then.getTime();

  if (isNaN(then.getTime())) return "";

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}sec ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}day ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}wk ago`;

  const years = Math.floor(weeks / 52);
  return `${years}yr ago`;
}


