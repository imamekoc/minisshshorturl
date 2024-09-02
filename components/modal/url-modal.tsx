'use client';

import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import isSlug from 'validator/es/lib/isSlug';
import { zodResolver } from '@hookform/resolvers/zod';

import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUrlModal } from '@/hooks/use-url-modal';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

// Fungsi untuk menghasilkan keyword acak
const generateRandomKeyword = (length = 4) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

const formSchema = z.object({
  url: z.string().toLowerCase().url({ message: 'Please enter a valid URL.' }),
  keyword: z
    .string()
    .toLowerCase()
    .min(3, { message: 'Please enter 3 or more characters.' })
    .refine((string) => isSlug(string), {
      message: 'Please enter valid slug.'
    })
});

const UrlModal = () => {
  const router = useRouter();
  const urlModal = useUrlModal();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      keyword: ''
    }
  });
const onSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    setLoading(true);

    let title = values.keyword; // Default title to keyword

    try {
      // Attempt to get URL title
      const urlResponse = await axios.get(
        `https://api-title.vercel.app/api/title?url=${encodeURIComponent(values.url)}`,
        {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en,en-US;q=0.9,id;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Referer': 'https://www.google.com/'
          }
        }
      );

      // Use the title from the API response if available
      if (urlResponse.data && urlResponse.data.title) {
        title = urlResponse.data.title;
      }
    } catch (apiError) {
      // Log the error but continue with default title
      console.error('Failed to fetch URL title:', apiError);
    }

    // Post data to the server with the title
    const response = await axios.post('/api/link', { ...values, title }, {
      headers: {
        'long-url-title': title
      }
    });

    if (response.data.success) {
      form.reset();
      urlModal.onClose();
      router.push('/admin/url?page=1&per_page=10');
      router.refresh();

      toast({
        variant: 'success',
        title: 'Success!',
        description: 'Short URL has been created.'
      });
    }
  } catch (error: any) {
    // Improved error handling
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.error || 'Unknown error occurred';

      if (errorMessage === 'Please enter different keyword.') {
        form.setError('keyword', {
          type: 'manual',
          message: errorMessage
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: errorMessage
        });
      }
    } else {
      console.error('Request error:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
    }
  } finally {
    setLoading(false);
  }
};


  const handleGenerateKeyword = () => {
    const randomKeyword = generateRandomKeyword();
    form.setValue('keyword', randomKeyword);
  };

  return (
    <Modal
      title='Create Short URL'
      description='Paste your long link to be shortened with custom keyword.'
      isOpen={urlModal.isOpen}
      onClose={urlModal.onClose}
    >
      <div className='py-2 pb-4'>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paste the Long URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder='Example: https://super-long-link.com/long-params'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
<div className='pt-6 flex items-center gap-4 w-full'>
  <div className='flex-grow'>
  <FormField
      control={form.control}
      name='keyword'
      render={({ field }) => (
        <FormItem className='flex-grow'>
          <FormControl>
            <Input
              disabled={loading}
              placeholder='Example: short'
              {...field}
              className='w-full'
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
  <div className='flex-shrink-0'>
    <Button
      type='button'
      disabled={loading}
      onClick={handleGenerateKeyword}
      className='w-full md:w-auto bg-blue-500 hover:bg-blue-600'
    >
      Generate
    </Button>
  </div>
</div>


            <div className='pt-6 space-x-2 flex items-center justify-end w-full'>
              <Button
                type='button'
                disabled={loading}
                variant='outline'
                onClick={urlModal.onClose}
              >
                Cancel
              </Button>
              <Button disabled={loading} type='submit'>
                {loading && (
                  <>
                    <Loader2 className='animate-spin mr-2' size={18} />
                    Saving...
                  </>
                )}
                {!loading && <>Shorten URL</>}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};

export default UrlModal;
