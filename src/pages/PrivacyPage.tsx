import { ArrowLeft, Calendar, Shield, Lock, Mail, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Política de Privacidade</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-8">
          {/* Intro */}
          <section className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Esta Política de Privacidade descreve como a Luma ("nós", "nosso" ou "aplicação") 
              coleta, usa e protege suas informações quando você utiliza nossos serviços, 
              especialmente em relação à integração com o Google Calendar.
            </p>
            <p className="text-sm text-muted-foreground">
              Última atualização: Janeiro de 2025
            </p>
          </section>

          {/* Google Calendar Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Uso de Dados do Google Calendar</h2>
            </div>
            
            <p className="text-muted-foreground leading-relaxed">
              Quando você conecta sua conta do Google Calendar à Luma, utilizamos a API do Google 
              exclusivamente para verificar sua disponibilidade de horários.
            </p>

            {/* What we access */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium">
                <CheckCircle className="h-5 w-5" />
                <span>O que acessamos</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                <li>• Informações de disponibilidade (horários livres/ocupados)</li>
                <li>• Utilizamos exclusivamente a API FreeBusy do Google Calendar</li>
                <li>• Verificamos apenas se um horário está livre ou ocupado</li>
              </ul>
            </div>

            {/* What we DON'T access */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <XCircle className="h-5 w-5" />
                <span>O que NÃO acessamos</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                <li>• Títulos dos eventos</li>
                <li>• Descrições dos eventos</li>
                <li>• Participantes dos eventos</li>
                <li>• Locais dos eventos</li>
                <li>• Anexos ou detalhes de reuniões</li>
                <li>• Qualquer conteúdo dos seus compromissos</li>
              </ul>
            </div>

            {/* What we DON'T store */}
            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 font-medium">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span>O que NÃO armazenamos</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                <li>• Não armazenamos detalhes dos seus eventos</li>
                <li>• Não salvamos informações sobre seus compromissos</li>
                <li>• Tokens de acesso são armazenados de forma segura e criptografada</li>
                <li>• Você pode desconectar sua conta a qualquer momento nas configurações</li>
              </ul>
            </div>
          </section>

          {/* Purpose */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Finalidade do Uso</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos a informação de disponibilidade do seu Google Calendar exclusivamente para:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>• Verificar horários disponíveis para agendamento de sessões fotográficas</li>
              <li>• Evitar conflitos de agenda ao sugerir horários para clientes</li>
              <li>• Facilitar a marcação de reuniões e sessões de fotos</li>
            </ul>
          </section>

          {/* Security */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Segurança</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança adequadas para proteger suas informações:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>• Conexões criptografadas (HTTPS/TLS)</li>
              <li>• Tokens de autenticação armazenados de forma segura</li>
              <li>• Acesso restrito apenas às informações necessárias</li>
              <li>• Conformidade com os requisitos de segurança do Google</li>
            </ul>
          </section>

          {/* Revoke Access */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Revogação de Acesso</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você pode desconectar sua conta do Google Calendar a qualquer momento através das 
              configurações da sua conta na Luma. Ao desconectar, todos os tokens de acesso serão 
              removidos do nosso sistema.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Você também pode revogar o acesso diretamente através das{" "}
              <a 
                href="https://myaccount.google.com/permissions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                configurações de segurança da sua conta Google
              </a>.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold">Contato</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como 
              tratamos seus dados, entre em contato conosco:
            </p>
            <p className="text-muted-foreground">
              Email:{" "}
              <a 
                href="mailto:contato@ligadafotografia.com.br" 
                className="text-primary hover:underline"
              >
                contato@ligadafotografia.com.br
              </a>
            </p>
          </section>

          {/* Footer */}
          <section className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Luma by Liga da Fotografia. Todos os direitos reservados.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
