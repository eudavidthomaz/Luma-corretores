import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CheckCircle2, Unplug, Loader2, Plug2 } from "lucide-react";

interface GoogleCalendarCardProps {
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function GoogleCalendarCard({
  isConnected,
  isLoading,
  onConnect,
  onDisconnect,
}: GoogleCalendarCardProps) {
  return (
    <Card className="bento-card border-teal-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Plug2 className="h-4 w-4 text-teal-400" />
          Integração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <CalendarCheck className="h-5 w-5 text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm">Google Agenda</p>
            <p className="text-xs text-muted-foreground truncate">
              {isConnected
                ? "Verificação automática"
                : "Conectar agenda"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 flex-1 justify-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Conectada
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={onDisconnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unplug className="h-4 w-4" />
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              onClick={onConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarCheck className="h-4 w-4" />
              )}
              Conectar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
