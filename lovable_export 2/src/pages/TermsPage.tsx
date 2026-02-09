import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-luma-glass-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Termos de Uso</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground text-sm mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou usar a plataforma Luma ("Serviço"), você concorda em estar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deve usar nosso Serviço. 
              Estes termos constituem um acordo legal entre você e a Liga da Fotografia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Luma é uma plataforma SaaS B2B desenvolvida para fotógrafos profissionais, oferecendo:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Chatbot com Inteligência Artificial para captura e qualificação de leads</li>
              <li>Integração com Google Calendar para verificação de disponibilidade</li>
              <li>Mini-site profissional personalizável</li>
              <li>Sistema de gestão de histórias e portfólio</li>
              <li>Dashboard de análise e métricas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">3. Responsabilidade do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ao utilizar a Luma, você concorda que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>É responsável por todo o conteúdo que você publica ou compartilha através do chat e do mini-site</li>
              <li>Garante que possui todos os direitos necessários sobre o conteúdo enviado (imagens, textos, vídeos)</li>
              <li>Não utilizará o Serviço para fins ilegais, difamatórios, ofensivos ou que violem direitos de terceiros</li>
              <li>É responsável por manter suas credenciais de acesso seguras e confidenciais</li>
              <li>Notificará imediatamente sobre qualquer uso não autorizado de sua conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">4. Uso de Inteligência Artificial</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A Luma utiliza tecnologias de Inteligência Artificial para responder automaticamente às mensagens dos visitantes. 
              Ao usar nosso Serviço, você reconhece e aceita que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>A IA pode cometer erros ou fornecer informações imprecisas</li>
              <li>As respostas geradas pela IA não substituem aconselhamento profissional</li>
              <li>Você deve revisar e validar as respostas da IA antes de tomar decisões de negócio</li>
              <li>Não garantimos a precisão, completude ou adequação das respostas geradas automaticamente</li>
              <li>A qualidade das respostas depende das informações e contexto que você fornece</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">5. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O Serviço é fornecido "como está" e "conforme disponível". Na máxima extensão permitida por lei:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Não garantimos que o Serviço estará disponível ininterruptamente ou livre de erros</li>
              <li>Não somos responsáveis por danos indiretos, incidentais, especiais ou consequenciais</li>
              <li>Nossa responsabilidade total está limitada ao valor pago por você nos últimos 12 meses de uso do Serviço</li>
              <li>Não nos responsabilizamos por perdas de negócios, dados ou oportunidades decorrentes do uso ou impossibilidade de uso do Serviço</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">6. Pagamento e Assinatura</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Oferecemos diferentes planos de assinatura (Free, Pro, Ultra). Para planos pagos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>A cobrança é realizada mensalmente através do processador de pagamentos Stripe</li>
              <li>As assinaturas são renovadas automaticamente até o cancelamento</li>
              <li>Você pode cancelar sua assinatura a qualquer momento através do painel administrativo</li>
              <li>Cancelamentos não geram reembolso proporcional do período já pago</li>
              <li>Reservamo-nos o direito de alterar preços com aviso prévio de 30 dias</li>
              <li>Você terá a opção de cancelar antes que os novos preços entrem em vigor</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">7. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sobre os direitos de propriedade intelectual:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Luma, seus logotipos e elementos visuais são marcas registradas da Liga da Fotografia</li>
              <li>Você mantém todos os direitos sobre o conteúdo que envia para a plataforma</li>
              <li>Ao enviar conteúdo, você nos concede licença não exclusiva para exibir, reproduzir e distribuir esse conteúdo na plataforma</li>
              <li>Esta licença é limitada ao funcionamento do Serviço e encerra-se com a exclusão do conteúdo ou cancelamento da conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">8. Rescisão</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sobre o encerramento da sua conta:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Podemos suspender ou encerrar sua conta por violação destes Termos</li>
              <li>Você pode cancelar sua conta a qualquer momento através das configurações</li>
              <li>Após o cancelamento, seus dados poderão ser mantidos por até 30 dias para fins de backup</li>
              <li>Após esse período, todos os dados serão permanentemente excluídos</li>
              <li>Não somos obrigados a manter ou fornecer cópias dos seus dados após a exclusão</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">9. Alterações nos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
              Notificaremos você sobre alterações significativas por e-mail ou através de aviso na plataforma. 
              O uso continuado do Serviço após as alterações constitui sua aceitação dos novos Termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">10. Disposições Gerais</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Estes Termos são regidos pelas leis da República Federativa do Brasil</li>
              <li>Fica eleito o Foro da Comarca de São Paulo, SP, para dirimir quaisquer controvérsias</li>
              <li>Se qualquer disposição destes Termos for considerada inválida, as demais permanecerão em pleno vigor</li>
              <li>A falha em exercer qualquer direito não constitui renúncia ao mesmo</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-foreground">11. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">Liga da Fotografia</strong><br />
              E-mail: contato@ligadafotografia.com.br
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
