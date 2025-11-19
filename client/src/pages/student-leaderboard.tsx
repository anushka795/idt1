import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { getUser } from "@/lib/auth";

export default function StudentLeaderboard() {
  const currentUser = getUser();

  const { data: globalLeaderboard, isLoading: globalLoading } = useQuery({
    queryKey: ["/api/leaderboard/global"],
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  });

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ProtectedRoute requiredRole="student">
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-display mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">See where you rank among your peers</p>
          </div>

          <Tabs defaultValue="global" className="space-y-6">
            <TabsList>
              <TabsTrigger value="global" data-testid="tab-global">Global</TabsTrigger>
              {courses?.slice(0, 3).map((course: any) => (
                <TabsTrigger key={course.id} value={course.id} data-testid={`tab-course-${course.id}`}>
                  {course.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="global">
              {globalLoading ? (
                <Card>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                          <div className="w-8 h-8 bg-muted rounded"></div>
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="flex-1 h-4 bg-muted rounded"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : globalLeaderboard && globalLeaderboard.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {globalLeaderboard.map((entry: any, index: number) => {
                        const isCurrentUser = entry.userId === currentUser?.id;
                        return (
                          <div
                            key={entry.userId}
                            className={`flex items-center gap-4 p-4 ${
                              isCurrentUser ? "bg-primary/5 border-l-4 border-l-primary" : ""
                            }`}
                            data-testid={`leaderboard-row-${index + 1}`}
                          >
                            <div className="w-12 flex items-center justify-center">
                              {getMedalIcon(entry.rank) || (
                                <span className="text-lg font-bold font-display text-muted-foreground">
                                  #{entry.rank}
                                </span>
                              )}
                            </div>
                            <Avatar>
                              <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-semibold flex items-center gap-2">
                                {entry.name}
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="text-xs">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {entry.classYear} • {entry.branch}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold font-display">{entry.xp} XP</div>
                              <div className="text-sm text-muted-foreground">{entry.accuracy}% accuracy</div>
                            </div>
                            {entry.badges && entry.badges.length > 0 && (
                              <div className="flex gap-1">
                                {entry.badges.slice(0, 2).map((badge: string, i: number) => (
                                  <Award key={i} className="h-4 w-4 text-primary" />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No leaderboard data available yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {courses?.map((course: any) => (
              <TabsContent key={course.id} value={course.id}>
                <CourseLeaderboard courseId={course.id} currentUserId={currentUser?.id} />
              </TabsContent>
            ))}
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function CourseLeaderboard({ courseId, currentUserId }: { courseId: string; currentUserId?: string }) {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/leaderboard/course", courseId],
  });

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No one has attempted quizzes in this course yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {leaderboard.map((entry: any, index: number) => {
            const isCurrentUser = entry.userId === currentUserId;
            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-4 ${
                  isCurrentUser ? "bg-primary/5 border-l-4 border-l-primary" : ""
                }`}
                data-testid={`course-leaderboard-row-${index + 1}`}
              >
                <div className="w-12 flex items-center justify-center">
                  {getMedalIcon(entry.rank) || (
                    <span className="text-lg font-bold font-display text-muted-foreground">
                      #{entry.rank}
                    </span>
                  )}
                </div>
                <Avatar>
                  <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {entry.name}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {entry.classYear} • {entry.branch}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-display">{entry.courseXp} XP</div>
                  <div className="text-sm text-muted-foreground">{entry.accuracy}% accuracy</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
