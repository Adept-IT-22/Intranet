// components/Pages/Chats/mockData.js

export const users = [
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
  ];
  
  export const threads = [
    {
      id: 't1',
      name: 'General',
      type: 'group',
      messages: [
        { id: 1, senderId: 'u1', content: 'Hi team!', timestamp: Date.now() - 60000 },
        { id: 2, senderId: 'u2', content: 'Hello Alice!', timestamp: Date.now() - 30000 },
      ],
    },
    {
      id: 'u2',
      name: 'Bob',
      type: 'dm',
      messages: [
        { id: 3, senderId: 'u1', content: 'Hey Bob!', timestamp: Date.now() - 90000 },
        { id: 4, senderId: 'u2', content: 'Hey!', timestamp: Date.now() - 60000 },
      ],
    },
  ];
  