"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Phone, Send, Plus, Menu, X } from "lucide-react"
import Cookies from "js-cookie"
import { useChatWebSocket } from "@/hooks/useWebSocket"
import { getMessages, getChats } from "@/services/messages"

const Messaging = () => {
  const [username, setUsername] = useState("")
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)

  const { joinRoom, sendMessage, onReceiveMessage, onMessageSent, onConnect, onDisconnect } = useChatWebSocket()

  useEffect(() => {
    const storedUsername = Cookies.get("username")
    setUsername(storedUsername)
  }, [])

  useEffect(() => {
    if (!Cookies.get("access_token")) {
      window.location.href = "/signin"
    }
  }, [])

  useEffect(() => {
    onConnect(() => {
      console.log("Connected to unified WebSocket server")
    })

    onReceiveMessage(async (msg) => {
      console.log("Received message:", msg)
      await fetchChatGroups()
      if (selectedConversation?.id === msg.chatId) {
        await fetchMessagesForChat(selectedConversation.id)
      }
    })

    onMessageSent(async (data) => {
      console.log("Message sent confirmation:", data)
      if (selectedConversation) {
        await fetchMessagesForChat(selectedConversation.id)
      }
    })

    onDisconnect(() => {
      console.log("Disconnected from WebSocket server")
    })

    return () => {
      // Cleanup is handled by the hook
    }
  }, [selectedConversation, onConnect, onReceiveMessage, onMessageSent, onDisconnect])

  const fetchChatGroups = async () => {
    try {
      const data = await getChats()
      console.log("Chat Groups: ", data)
      if (data && !data.error) {
        setConversations(data)
      }
    } catch (error) {
      console.error("Error fetching chat groups:", error)
    }
  }

  useEffect(() => {
    fetchChatGroups()
  }, [])

  const fetchMessagesForChat = async (chatId) => {
    try {
      const data = await getMessages({ chatId: chatId.toString() })
      console.log("Messages: ", data)

      if (data && !data.error) {
        const formattedMessages =
          data?.map((msg) => ({
            id: msg.id,
            sender: msg.sender_name,
            message: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            isMine: msg.isMine,
          })) || []

        console.log("Formatted Messages: ", formattedMessages)
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    setSidebarOpen(false)

    if (conversation.id) {
      console.log(`Joining room for chat: ${conversation.id}`)
      joinRoom(conversation.id, username)
    }
  }

  useEffect(() => {
    if (selectedConversation) {
      fetchMessagesForChat(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView()
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedConversation) return

    sendMessage(selectedConversation.id, newMessage)
    setNewMessage("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const filteredConversations = conversations?.filter(
    (conv) =>
      conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.chattitle?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col md:flex-row h-screen">
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
          } md:block w-full md:w-80 lg:w-96 border-r bg-white z-20 md:relative absolute inset-0 md:inset-auto flex flex-col`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-xl font-semibold">Messages</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 border border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            <div className="divide-y">
              {filteredConversations?.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id ? "bg-primary/10 border-l-4 border-primary/50" : ""
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt={conversation.chattitle} />
                        <AvatarFallback>
                          {(conversation.chattitle || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm text-gray-900 truncate">
                          {conversation.chattitle || "Unknown User"}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {conversation.updated_at ? new Date(conversation.updated_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastmessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt={selectedConversation.participant_name || selectedConversation.name}
                    />
                    <AvatarFallback>
                      {(
                        selectedConversation.participant_name ||
                        selectedConversation.name ||
                        selectedConversation.chattitle ||
                        "U"
                      )
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-gray-900">{selectedConversation.chattitle}</h2>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
                {/* <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Call</span>
                </Button> */}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3 flex flex-col">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        msg.isMine
                          ? "bg-primary/90 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm lg:text-base break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 font-medium ${msg.isMine ? "text-primary-100" : "text-gray-500"}`}>
                        {msg.time}
                      </p>
                    </div>
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
                    className="flex-1 border border-gray-200"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary text-white hover:bg-primary/80 cursor-pointer"
                  >
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
