
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Phone, Send, Plus, Menu, X } from "lucide-react"
import Cookies from "js-cookie"

const conversations = [
  {
    id: 1,
    name: "Ahmed Ali Khan",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I need help with my waste collection schedule",
    time: "12m",
    unread: true,
    online: true,
    tags: ["Question"],
  },
  {
    id: 2,
    name: "Fatima Sheikh",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "When will the payment be processed?",
    time: "24m",
    unread: false,
    online: false,
    tags: ["Payment"],
  },
  {
    id: 3,
    name: "Muhammad Usman",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "The app is not working properly on my phone",
    time: "1h",
    unread: true,
    online: true,
    tags: ["Bug", "Technical"],
  },
  {
    id: 4,
    name: "Ayesha Malik",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thank you for your quick response!",
    time: "5h",
    unread: false,
    online: false,
    tags: [],
  },
  {
    id: 5,
    name: "Hassan Raza",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "I would like to request a special pickup",
    time: "2d",
    unread: false,
    online: false,
    tags: ["Request"],
  },
]

const messageHistory = {
  1: [
    {
      id: 1,
      sender: "user",
      message: "Hello, I need help with my waste collection schedule. It seems like the truck didn't come this week.",
      time: "11:45 AM",
    },
    {
      id: 2,
      sender: "support",
      message: "Hi Ahmed, I'm sorry to hear that. Let me check the schedule for your area.",
      time: "11:47 AM",
    },
    {
      id: 3,
      sender: "support",
      message:
        "I can see that there was a route change due to road construction. Your collection has been rescheduled for tomorrow morning.",
      time: "11:50 AM",
    },
    {
      id: 4,
      sender: "user",
      message: "Oh, I see. Was there any notification about this?",
      time: "11:52 AM",
    },
  ],
  2: [
    {
      id: 1,
      sender: "user",
      message: "Hi, I made a payment yesterday but it's still showing as pending in my account.",
      time: "11:20 AM",
    },
    {
      id: 2,
      sender: "support",
      message: "Hello Fatima, thank you for reaching out. Let me check that for you.",
      time: "11:22 AM",
    },
    {
      id: 3,
      sender: "support",
      message:
        "I can confirm that your payment has been received. It usually takes 24-48 hours to reflect in your account. It should be updated by tomorrow.",
      time: "11:25 AM",
    },
    {
      id: 4,
      sender: "user",
      message: "When will the payment be processed?",
      time: "11:36 AM",
    },
  ],
  3: [
    {
      id: 1,
      sender: "user",
      message: "The app keeps crashing when I try to schedule a pickup.",
      time: "10:15 AM",
    },
    {
      id: 2,
      sender: "support",
      message: "I'm sorry to hear that, Muhammad. What type of phone are you using?",
      time: "10:17 AM",
    },
    {
      id: 3,
      sender: "user",
      message: "I'm using a Samsung Galaxy S10.",
      time: "10:20 AM",
    },
    {
      id: 4,
      sender: "support",
      message:
        "Thank you for that information. We've had some reports of issues with that model. Can you try clearing the app cache and restarting your phone?",
      time: "10:25 AM",
    },
    {
      id: 5,
      sender: "user",
      message: "The app is not working properly on my phone",
      time: "11:05 AM",
    },
  ],
  4: [
    {
      id: 1,
      sender: "support",
      message:
        "Hello Ayesha, I've processed your refund request. You should see the amount back in your account within 5-7 business days.",
      time: "8:30 AM",
    },
    {
      id: 2,
      sender: "user",
      message: "That was quick! I appreciate your help.",
      time: "8:45 AM",
    },
    {
      id: 3,
      sender: "support",
      message: "You're welcome! Is there anything else I can help you with today?",
      time: "8:47 AM",
    },
    {
      id: 4,
      sender: "user",
      message: "Thank you for your quick response!",
      time: "8:55 AM",
    },
  ],
  5: [
    {
      id: 1,
      sender: "user",
      message: "Hello, I have some large items that need to be picked up. Is that possible?",
      time: "Yesterday",
    },
    {
      id: 2,
      sender: "support",
      message:
        "Hi Hassan, yes we do offer special pickups for large items. Could you please provide more details about what items you need collected?",
      time: "Yesterday",
    },
    {
      id: 3,
      sender: "user",
      message: "I have an old sofa and a refrigerator that I need to dispose of.",
      time: "Yesterday",
    },
    {
      id: 4,
      sender: "support",
      message:
        "We can definitely help with that. There is an additional fee for large items. I can schedule a pickup for you. What day would work best?",
      time: "Yesterday",
    },
    {
      id: 5,
      sender: "user",
      message: "I would like to request a special pickup",
      time: "Yesterday",
    },
  ],
}

const getTagColor = (tag) => {
  switch (tag) {
    case "Question":
      return "bg-orange-100 text-orange-800"
    case "Bug":
      return "bg-red-100 text-red-800"
    case "Technical":
      return "bg-purple-100 text-purple-800"
    case "Payment":
      return "bg-green-100 text-green-800"
    case "Request":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const Messaging = () => {
  const [username, setUsername] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    setUsername(Cookies.get("username"))
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      setMessages(messageHistory[selectedConversation.id] || [])
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const newMsg = {
      id: messages.length + 1,
      sender: "support",
      message: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Messages</h1>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-80 lg:w-96 border-r bg-white z-20 md:relative absolute inset-0`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-semibold">Messages</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="md:flex hidden">
                  <Plus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all" className="mt-0">
                  <div className="divide-y">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${
                          selectedConversation?.id === conversation.id ? "bg-[#F7F6FE]" : ""
                        }`}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          setSidebarOpen(false)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                              <AvatarFallback>
                                {conversation.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.online && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                            {conversation.unread && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">
                                !
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{conversation.time}</span>
                            </div>
                            <p
                              className={`text-sm truncate ${
                                conversation.unread ? "text-gray-900 font-medium" : "text-gray-500"
                              }`}
                            >
                              {conversation.lastMessage}
                            </p>
                            {conversation.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {conversation.tags.map((tag, index) => (
                                  <Badge key={index} className={`text-xs ${getTagColor(tag)}`}>
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="unread" className="mt-0">
                  <div className="divide-y">
                    {filteredConversations
                      .filter((conv) => conv.unread)
                      .map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            selectedConversation?.id === conversation.id ? "bg-[#F7F6FE]" : ""
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation)
                            setSidebarOpen(false)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={conversation.avatar || "/placeholder.svg"} alt={conversation.name} />
                                <AvatarFallback>
                                  {conversation.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.online && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                              )}
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] flex items-center justify-center rounded-full">
                                !
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-sm truncate">{conversation.name}</h3>
                                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                  {conversation.time}
                                </span>
                              </div>
                              <p className="text-sm truncate text-gray-900 font-medium">{conversation.lastMessage}</p>
                              {conversation.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {conversation.tags.map((tag, index) => (
                                    <Badge key={index} className={`text-xs ${getTagColor(tag)}`}>
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={selectedConversation.avatar || "/placeholder.svg"}
                      alt={selectedConversation.name}
                    />
                    <AvatarFallback>
                      {selectedConversation.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">{selectedConversation.name}</h2>
                    <div className="flex items-center gap-1">
                      {selectedConversation.online ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-xs text-gray-500">Online</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">Offline</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Call</span>
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "support" ? "justify-end" : "justify-start"}`}>
                    {msg.sender === "user" && (
                      <Avatar className="mr-2 mt-1">
                        <AvatarImage
                          src={selectedConversation.avatar || "/placeholder.svg"}
                          alt={selectedConversation.name}
                        />
                        <AvatarFallback>
                          {selectedConversation.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] ${
                        msg.sender === "support"
                          ? "bg-primary text-white rounded-l-lg rounded-br-lg"
                          : "bg-gray-100 text-gray-800 rounded-r-lg rounded-bl-lg"
                      } p-3 text-sm`}
                    >
                      <p>{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "support" ? "text-blue-100" : "text-gray-500"}`}>
                        {msg.time}
                      </p>
                    </div>
                    {msg.sender === "support" && (
                      <Avatar className="ml-2 mt-1">
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Support" />
                        <AvatarFallback>CS</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
                <p className="text-gray-500 mt-1">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messaging
