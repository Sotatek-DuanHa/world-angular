import { Component, Input, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  injectQuery
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { PostService } from './data-access/post.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  @switch (postQ.status()) {
    @case ('pending') {
      Loading...
    }
    @case ('error') {
      Error!
    }
    @default {
      <h3 style="color: aquamarine;">{{ postQ.data()?.title }}</h3>
      <p style="color: aquamarine;">{{ postQ.data()?.content }}</p>
    }
  }
`,

})

export default class PostIdComponent {
 @Input({required: true}) postId!:string 
  #postService = inject(PostService);

  postQ = injectQuery(() => ({
    queryKey: ['PostService', 'getPostById', this.postId],
    queryFn: () =>
      lastValueFrom(this.#postService.getPostById(String(this.postId))),
  }));
}
