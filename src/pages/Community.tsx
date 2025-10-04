import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, UserPlus, Search, Users, Check, X, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';

export function Community() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filter, setFilter] = useState<'global' | 'friends'>('global');
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends' | 'search'>('leaderboard');
  
  // Friends state
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    fetchFriends();
    fetchFriendRequests();

    // Setup realtime subscriptions
    const friendsSubscription = supabase
      .channel('friends-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'friends',
          filter: `user_id=eq.${profile?.id}`,
        },
        (payload) => {
          console.log('Friends change detected:', payload);
          // Refresh friends list
          fetchFriends();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${profile?.id}`,
        },
        (payload) => {
          console.log('Friend request change detected:', payload);
          // Refresh friend requests
          fetchFriendRequests();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(friendsSubscription);
    };
  }, [profile?.id]);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, total_points, level, current_streak')
      .order('total_points', { ascending: false })
      .limit(100);

    setLeaderboard(data || []);
  };

  const fetchFriends = async () => {
    try {
      // Get accepted friends where user is the sender
      const { data: sentFriends, error: error1 } = await supabase
        .from('friends')
        .select('id, friend_id, created_at')
        .eq('user_id', profile?.id)
        .eq('status', 'accepted');

      // Get accepted friends where user is the receiver
      const { data: receivedFriends, error: error2 } = await supabase
        .from('friends')
        .select('id, user_id, created_at')
        .eq('friend_id', profile?.id)
        .eq('status', 'accepted');

      if (error1 || error2) throw error1 || error2;

      // Combine both directions
      const allFriendIds = [
        ...(sentFriends || []).map(f => f.friend_id),
        ...(receivedFriends || []).map(f => f.user_id)
      ];

      if (allFriendIds.length > 0) {
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, total_points, level, current_streak')
          .in('id', allFriendIds);

        // Map back to friendship records
        const friendsWithProfiles = [
          ...(sentFriends || []).map(friendship => ({
            ...friendship,
            friend_id: friendship.friend_id,
            friend: friendProfiles?.find(p => p.id === friendship.friend_id)
          })),
          ...(receivedFriends || []).map(friendship => ({
            ...friendship,
            friend_id: friendship.user_id,
            friend: friendProfiles?.find(p => p.id === friendship.user_id)
          }))
        ];

        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      // Incoming requests
      const { data: incoming, error: incomingError } = await supabase
        .from('friends')
        .select('id, user_id, created_at')
        .eq('friend_id', profile?.id)
        .eq('status', 'pending');

      if (incomingError) throw incomingError;

      // Fetch requester profiles
      if (incoming && incoming.length > 0) {
        const userIds = incoming.map(req => req.user_id);
        const { data: requesterProfiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, level')
          .in('id', userIds);

        const incomingWithProfiles = incoming.map(req => ({
          ...req,
          requester: requesterProfiles?.find(p => p.id === req.user_id)
        }));

        setFriendRequests(incomingWithProfiles);
      } else {
        setFriendRequests([]);
      }

      // Outgoing requests
      const { data: outgoing, error: outgoingError } = await supabase
        .from('friends')
        .select('id, friend_id, created_at')
        .eq('user_id', profile?.id)
        .eq('status', 'pending');

      if (outgoingError) throw outgoingError;

      // Fetch receiver profiles
      if (outgoing && outgoing.length > 0) {
        const friendIds = outgoing.map(req => req.friend_id);
        const { data: receiverProfiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, level')
          .in('id', friendIds);

        const outgoingWithProfiles = outgoing.map(req => ({
          ...req,
          receiver: receiverProfiles?.find(p => p.id === req.friend_id)
        }));

        setSentRequests(outgoingWithProfiles);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setFriendRequests([]);
      setSentRequests([]);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, total_points, level, current_streak')
      .ilike('name', `%${searchQuery}%`)
      .neq('id', profile?.id)
      .limit(20);

    // Check friend status for each result
    const resultsWithStatus = await Promise.all(
      (data || []).map(async (user) => {
        // Check if already friends
        const { data: friendData } = await supabase
          .from('friends')
          .select('status')
          .or(`and(user_id.eq.${profile?.id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${profile?.id})`)
          .single();

        return {
          ...user,
          friendStatus: friendData?.status || 'none',
        };
      })
    );

    setSearchResults(resultsWithStatus);
    setSearching(false);
  };

  const sendFriendRequest = async (friendId: string) => {
    const { error } = await supabase
      .from('friends')
      .insert([
        {
          user_id: profile?.id,
          friend_id: friendId,
          status: 'pending',
        },
      ]);

    if (error) {
      showToast('Failed to send friend request', 'error');
    } else {
      showToast('Friend request sent!', 'success');
      searchUsers(); // Refresh search results
      fetchFriendRequests();
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      showToast('Failed to accept friend request', 'error');
    } else {
      showToast('Friend request accepted!', 'success');
      // Refresh both friends and requests
      await Promise.all([fetchFriends(), fetchFriendRequests()]);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId);

    if (error) {
      showToast('Failed to decline friend request', 'error');
    } else {
      showToast('Friend request declined', 'info');
      fetchFriendRequests();
    }
  };

  const removeFriend = async (friendshipId: string, friendUserId: string) => {
    // Need to remove both directions if they exist
    const { error: error1 } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId);

    // Also check and remove the reverse relationship if it exists
    const { error: error2 } = await supabase
      .from('friends')
      .delete()
      .or(`and(user_id.eq.${profile?.id},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${profile?.id})`);

    if (error1 && error2) {
      showToast('Failed to remove friend', 'error');
    } else {
      showToast('Friend removed', 'info');
      fetchFriends();
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getAvatar = (user: any) => {
    if (user.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
        {user.name?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  const userRank = leaderboard.findIndex((user) => user.id === profile?.id) + 1;
  const displayedLeaderboard = filter === 'friends' 
    ? leaderboard.filter(user => friends.some(f => f.friend.id === user.id))
    : leaderboard;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with others and compete on the leaderboard
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'leaderboard'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Trophy className="inline w-5 h-5 mr-2" />
          Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeTab === 'friends'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Users className="inline w-5 h-5 mr-2" />
          Friends
          {friendRequests.length > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {friendRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Search className="inline w-5 h-5 mr-2" />
          Find Friends
        </button>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <>
          {userRank > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Rank</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">#{userRank}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Points</p>
                    <p className="text-3xl font-bold text-[#4CAF50]">{profile?.total_points || 0}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-[#4CAF50]" />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              variant={filter === 'global' ? 'primary' : 'outline'}
              onClick={() => setFilter('global')}
            >
              Global
            </Button>
            <Button
              variant={filter === 'friends' ? 'primary' : 'outline'}
              onClick={() => setFilter('friends')}
            >
              Friends Only
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {filter === 'global' ? 'Top 100 Users' : 'Friends Leaderboard'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayedLeaderboard.slice(0, 20).map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      user.id === profile?.id
                        ? 'bg-green-100 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="w-8 text-center font-bold text-gray-600 dark:text-gray-400">
                      {getRankIcon(index) || `#${index + 1}`}
                    </div>
                    {getAvatar(user)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {user.name}
                        {user.id === profile?.id && (
                          <Badge variant="success" className="ml-2">
                            You
                          </Badge>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Level {user.level} • {user.current_streak} day streak
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#4CAF50]">{user.total_points}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <>
          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Friend Requests ({friendRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                    >
                      {getAvatar(request.requester)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.requester.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {request.requester.level}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => acceptFriendRequest(request.id)}
                          className="flex items-center gap-2"
                        >
                          <Check size={16} />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => declineFriendRequest(request.id)}
                          className="flex items-center gap-2"
                        >
                          <X size={16} />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Requests ({sentRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      {getAvatar(request.receiver)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.receiver.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {request.receiver.level}
                        </p>
                      </div>
                      <Badge variant="warning" className="flex items-center gap-1">
                        <Clock size={14} />
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Friends List */}
          <Card>
            <CardHeader>
              <CardTitle>My Friends ({friends.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No friends yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                    Start by searching and adding friends!
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab('search')}>
                    Find Friends
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friendship) => (
                    <div
                      key={friendship.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {getAvatar(friendship.friend)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {friendship.friend.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {friendship.friend.level} • {friendship.friend.current_streak} day streak • {friendship.friend.total_points} XP
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => removeFriend(friendship.id, friendship.friend.id)}
                        className="text-red-600 hover:text-red-700 hover:border-red-600"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle>Find Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  icon={<Search size={20} />}
                />
                <Button
                  variant="primary"
                  onClick={searchUsers}
                  isLoading={searching}
                >
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      {getAvatar(user)}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Level {user.level} • {user.current_streak} day streak • {user.total_points} XP
                        </p>
                      </div>
                      {user.friendStatus === 'none' && (
                        <Button
                          variant="primary"
                          onClick={() => sendFriendRequest(user.id)}
                          className="flex items-center gap-2"
                        >
                          <UserPlus size={16} />
                          Add Friend
                        </Button>
                      )}
                      {user.friendStatus === 'pending' && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Clock size={14} />
                          Pending
                        </Badge>
                      )}
                      {user.friendStatus === 'accepted' && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Check size={14} />
                          Friends
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !searching && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Try searching with a different name
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Stories (always visible at bottom) */}
      {activeTab === 'leaderboard' && (
        <Card>
          <CardHeader>
            <CardTitle>Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-semibold">
                    S
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">Sarah Johnson</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "I've reduced my food waste by 60% in just 3 months! FOOPTRA helped me understand my patterns and make better choices."
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="success">60% Reduction</Badge>
                      <Badge variant="info">90 Day Streak</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}