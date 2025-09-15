import { Component, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements AfterViewInit {
  currentYear: number = new Date().getFullYear();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return; // Ensure we are in the browser

    this.createParticles();
    this.animateDemo();
  }

  createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  animateDemo() {
    const chatDemo = document.getElementById('chatDemo');
    if (!chatDemo) return;

    const messages = [
      { type: 'user', content: 'What are the main conclusions?', delay: 2000 },
      { type: 'bot', content: 'The document concludes that AI integration increases productivity by 40% while reducing processing time significantly.', delay: 4000 },
      { type: 'user', content: 'Show me the methodology section', delay: 6000 },
      { type: 'bot', content: 'The methodology is outlined in Section 3, pages 12-15. It uses a mixed-methods approach combining quantitative surveys with qualitative interviews.', delay: 8000 }
    ];

    let currentIndex = 0;

    const addMessage = () => {
      if (currentIndex >= messages.length) {
        setTimeout(() => {
          chatDemo.innerHTML = `
            <div class="message user">
              <div class="message-avatar user-avatar">U</div>
              <div class="message-content">What are the key findings in the research paper?</div>
            </div>
            <div class="message bot">
              <div class="message-avatar bot-avatar">AI</div>
              <div class="message-content">Based on the document, there are three key findings: 1) Performance improved by 23%, 2) User satisfaction increased significantly, and 3) Cost reduction of 15% was achieved.</div>
            </div>`;
          currentIndex = 0;
          setTimeout(addMessage, 2000);
        }, 3000);
        return;
      }

      const message = messages[currentIndex];
      const messageEl = document.createElement('div');
      messageEl.className = `message ${message.type}`;

      if (message.type === 'user') {
        messageEl.innerHTML = `
          <div class="message-avatar user-avatar">U</div>
          <div class="message-content">${message.content}</div>`;
        chatDemo.appendChild(messageEl);
        currentIndex++;
        setTimeout(addMessage, message.delay);
      } else {
        // Show typing indicator first
        const typingEl = document.createElement('div');
        typingEl.className = 'message bot';
        typingEl.innerHTML = `
          <div class="message-avatar bot-avatar">AI</div>
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>`;
        chatDemo.appendChild(typingEl);

        setTimeout(() => {
          chatDemo.removeChild(typingEl);
          messageEl.innerHTML = `
            <div class="message-avatar bot-avatar">AI</div>
            <div class="message-content">${message.content}</div>`;
          chatDemo.appendChild(messageEl);
          currentIndex++;
          setTimeout(addMessage, message.delay);
        }, 2000);
      }
    };

    setTimeout(addMessage, 3000);
  }
}
