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

      // Get URL title
      // const urlResponse = await axios.get(
      //   `https://api.allorigins.win/get?url=${encodeURIComponent(values.url)}`
      // );

      // const matches = urlResponse.data.contents.match(/<title>(.*?)<\/title>/);
      const title = values.keyword;

      const response = await axios.post('/api/link', values, {
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
      if (error.response.data.error === 'Please enter different keyword.') {
        form.setError('keyword', {
          type: 'manual',
          message: error.response.data.error
        });
      } else {
        console.log(error);
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
